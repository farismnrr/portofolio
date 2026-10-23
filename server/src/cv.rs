use std::time::{SystemTime, UNIX_EPOCH};

use axum::{
    body::Body,
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use tokio::{fs, process::Command};

const MAX_LAYOUT_PASSES: usize = 16;

use crate::profiles::{self, CvProfile};

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CvRenderRequest {
    #[serde(default)]
    contract_version: Option<String>,
    #[serde(default)]
    profile_id: Option<String>,
    name: String,
    headline: String,
    contact: String,
    profile_summary: String,
    technical_scope: Vec<ScopeLine>,
    projects: Vec<ProjectSection>,
    experiences: Vec<ExperienceSection>,
    certifications: Vec<CertificationSection>,
    education_lines: Vec<String>,
    max_pages: u8,
}

#[derive(Clone, Deserialize)]
pub struct ScopeLine {
    label: String,
    text: String,
}

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSection {
    title: String,
    kind: String,
    meta: String,
    narrative: String,
    tech_stack: String,
}

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExperienceSection {
    #[serde(default)]
    kind: String,
    title: String,
    meta: String,
    summary: String,
    related_projects: Vec<ProjectReference>,
    bullets: Vec<String>,
}

#[derive(Clone, Deserialize)]
pub struct ProjectReference {
    title: String,
    url: String,
}

#[derive(Clone, Deserialize)]
pub struct CertificationSection {
    title: String,
    meta: String,
    url: String,
}

#[derive(Clone, Copy)]
struct DensityProfile {
    name: &'static str,
    body_size: f32,
    line_height: f32,
    section_gap: f32,
    item_gap: f32,
    bullet_gap: f32,
    horizontal_margin: f32,
    vertical_margin: f32,
}

const DENSITY_PROFILES: [DensityProfile; 3] = [
    DensityProfile {
        name: "comfortable",
        body_size: 10.5,
        line_height: 1.42,
        section_gap: 18.0,
        item_gap: 12.0,
        bullet_gap: 4.0,
        horizontal_margin: 0.70,
        vertical_margin: 0.70,
    },
    DensityProfile {
        name: "roomy",
        body_size: 10.8,
        line_height: 1.46,
        section_gap: 20.0,
        item_gap: 14.0,
        bullet_gap: 5.0,
        horizontal_margin: 0.72,
        vertical_margin: 0.72,
    },
    DensityProfile {
        name: "spacious",
        body_size: 11.0,
        line_height: 1.5,
        section_gap: 22.0,
        item_gap: 16.0,
        bullet_gap: 6.0,
        horizontal_margin: 0.75,
        vertical_margin: 0.75,
    },
];

struct PdfInspection {
    pages: usize,
    fill_ratio: f64,
    text: String,
}

struct PdfCandidate {
    bytes: Vec<u8>,
    fill_ratio: f64,
    profile_name: &'static str,
}

pub async fn render(Json(payload): Json<CvRenderRequest>) -> Response {
    let profile_id = payload.profile_id.as_deref().unwrap_or("general");
    let profile = match profiles::get(profile_id) {
        Ok(profile) => profile,
        Err(error) => return (StatusCode::BAD_REQUEST, error).into_response(),
    };

    let mut payload = payload;
    payload.headline = profile.headline.clone();

    if let Err(message) = validate_document(&payload, profile) {
        return (StatusCode::BAD_REQUEST, message).into_response();
    }

    match render_validated_pdf(payload, profile).await {
        Ok(candidate) => {
            tracing::info!(
                profile = candidate.profile_name,
                fill_ratio = candidate.fill_ratio,
                "generated validated CV PDF"
            );

            Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/pdf")
                .header(
                    header::CONTENT_DISPOSITION,
                    format!("attachment; filename=\"{}\"", profile.filename),
                )
                .header(header::CACHE_CONTROL, "no-store")
                .body(Body::from(candidate.bytes))
                .expect("valid PDF response")
        }
        Err(error) => {
            tracing::error!(%error, "CV PDF failed final layout validation");
            (
                StatusCode::UNPROCESSABLE_ENTITY,
                format!("CV layout validation failed: {error}"),
            )
                .into_response()
        }
    }
}

fn validate_document(document: &CvRenderRequest, profile: &CvProfile) -> Result<(), String> {
    if document.name.trim().is_empty() || document.profile_summary.trim().is_empty() {
        return Err("CV identity and professional summary are required".to_string());
    }
    if document.technical_scope.is_empty() {
        return Err("CV skills are required".to_string());
    }
    if document.technical_scope.len() != profile.technical_scopes.len() {
        return Err(format!(
            "CV technical scope count {} does not match profile {} scope count {}",
            document.technical_scope.len(),
            profile.id,
            profile.technical_scopes.len()
        ));
    }
    for (index, (actual, expected)) in document
        .technical_scope
        .iter()
        .zip(&profile.technical_scopes)
        .enumerate()
    {
        if actual.label != expected.label {
            return Err(format!(
                "CV technical scope {} label does not match profile {}",
                index + 1,
                profile.id
            ));
        }
    }
    if document.experiences.is_empty() {
        return Err("CV work experience is required".to_string());
    }
    if document.projects.is_empty() {
        return Err("CV projects are required".to_string());
    }
    if document.certifications.is_empty() {
        return Err("CV certifications are required".to_string());
    }
    if document.education_lines.is_empty() {
        return Err("CV education is required".to_string());
    }
    if document.max_pages == 0 {
        return Err("CV page budget must be greater than zero".to_string());
    }
    if document.max_pages != profile.max_pages {
        return Err(format!(
            "CV page budget {} does not match profile {} budget {}",
            document.max_pages, profile.id, profile.max_pages
        ));
    }
    if let Some(contract_version) = &document.contract_version {
        if contract_version != profiles::CONTRACT_VERSION {
            return Err(format!(
                "unsupported CV contract version: {contract_version}"
            ));
        }
    }

    Ok(())
}

async fn render_validated_pdf(
    mut document: CvRenderRequest,
    profile: &CvProfile,
) -> Result<PdfCandidate, String> {
    for pass in 0..MAX_LAYOUT_PASSES {
        let mut best: Option<PdfCandidate> = None;
        let mut smallest_page_count = usize::MAX;

        for density in DENSITY_PROFILES {
            if density.body_size < profile.layout_policy.min_body_size_pt.max(10.5) {
                continue;
            }
            let candidate = render_candidate(&document, density, pass).await?;
            smallest_page_count = smallest_page_count.min(candidate.1.pages);

            if candidate.1.pages > usize::from(profile.max_pages) {
                continue;
            }

            validate_pdf_contents(&document, &candidate.1)?;

            if candidate.1.pages > 1
                && candidate.1.fill_ratio < profile.layout_policy.min_second_page_fill
            {
                continue;
            }

            let next = PdfCandidate {
                bytes: candidate.0,
                fill_ratio: candidate.1.fill_ratio,
                profile_name: density.name,
            };

            if best
                .as_ref()
                .is_none_or(|current| next.fill_ratio > current.fill_ratio)
            {
                best = Some(next);
            }
        }

        if let Some(best) = best {
            return Ok(best);
        }

        if trim_lowest_priority_optional_item(&mut document, profile) {
            continue;
        }

        return Err(format!(
            "document still exceeds {} pages after bounded fitting",
            profile.max_pages
        ));
    }

    Err("layout fitting exhausted its bounded passes".to_string())
}

async fn render_candidate(
    document: &CvRenderRequest,
    profile: DensityProfile,
    pass: usize,
) -> Result<(Vec<u8>, PdfInspection), String> {
    let _ = pass;
    render_pdf_html(&render_html(document, profile)).await
}

#[cfg(feature = "role-match")]
pub(crate) async fn render_report_pdf(html: &str, required: &[String]) -> Result<Vec<u8>, String> {
    let (bytes, inspection) = render_pdf_html(html).await?;
    if inspection.pages > 12 {
        return Err("report exceeds the 12-page limit".into());
    }
    let normalized = normalize_text(&inspection.text);
    for value in required {
        ensure_text_present(&normalized, value, "report content")?;
    }
    Ok(bytes)
}

struct PdfTempFiles {
    html: String,
    pdf: String,
    profile: String,
}
impl Drop for PdfTempFiles {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.html);
        let _ = std::fs::remove_file(&self.pdf);
        let _ = std::fs::remove_file(format!("{}.bbox.html", self.pdf));
        let _ = std::fs::remove_dir_all(&self.profile);
    }
}

async fn render_pdf_html(html: &str) -> Result<(Vec<u8>, PdfInspection), String> {
    let suffix = unique_suffix();
    let html_path = format!("/tmp/portfolio-pdf-{suffix}.html");
    let pdf_path = format!("/tmp/portfolio-pdf-{suffix}.pdf");
    let profile_path = format!("/tmp/chromium-profile-{suffix}");

    let _temporary_files = PdfTempFiles {
        html: html_path.clone(),
        pdf: pdf_path.clone(),
        profile: profile_path.clone(),
    };

    fs::write(&html_path, html)
        .await
        .map_err(|error| format!("failed to write temporary CV HTML: {error}"))?;

    let output = Command::new("chromium")
        .kill_on_drop(true)
        .env("HOME", "/tmp")
        .env("XDG_CONFIG_HOME", "/tmp/chromium-config")
        .env("XDG_CACHE_HOME", "/tmp/chromium-cache")
        .args([
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-crash-reporter",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            &format!("--user-data-dir={profile_path}"),
            &format!("--print-to-pdf={pdf_path}"),
            &format!("file://{html_path}"),
        ])
        .output()
        .await
        .map_err(|error| format!("failed to launch Chromium: {error}"))?;

    if !output.status.success() {
        cleanup_attempt(&html_path, &pdf_path, &profile_path).await;
        return Err(format!(
            "Chromium failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let bytes = fs::read(&pdf_path)
        .await
        .map_err(|error| format!("failed to read generated PDF: {error}"))?;

    if !bytes.starts_with(b"%PDF") {
        cleanup_attempt(&html_path, &pdf_path, &profile_path).await;
        return Err("Chromium generated an invalid PDF payload".to_string());
    }

    let inspection = inspect_pdf(&pdf_path).await?;
    cleanup_attempt(&html_path, &pdf_path, &profile_path).await;

    Ok((bytes, inspection))
}

async fn inspect_pdf(pdf_path: &str) -> Result<PdfInspection, String> {
    let info = Command::new("pdfinfo")
        .arg(pdf_path)
        .output()
        .await
        .map_err(|error| format!("failed to run pdfinfo: {error}"))?;

    if !info.status.success() {
        return Err(format!(
            "pdfinfo failed: {}",
            String::from_utf8_lossy(&info.stderr)
        ));
    }

    let info_text = String::from_utf8_lossy(&info.stdout);
    let pages = info_text
        .lines()
        .find_map(|line| {
            line.strip_prefix("Pages:")
                .and_then(|value| value.trim().parse::<usize>().ok())
        })
        .ok_or_else(|| "pdfinfo did not report a page count".to_string())?;

    let text_output = Command::new("pdftotext")
        .args([pdf_path, "-"])
        .output()
        .await
        .map_err(|error| format!("failed to extract PDF text: {error}"))?;

    if !text_output.status.success() {
        return Err(format!(
            "pdftotext failed: {}",
            String::from_utf8_lossy(&text_output.stderr)
        ));
    }

    let bbox_path = format!("{pdf_path}.bbox.html");
    let bbox_output = Command::new("pdftotext")
        .args(["-bbox-layout", pdf_path, &bbox_path])
        .output()
        .await
        .map_err(|error| format!("failed to inspect PDF geometry: {error}"))?;

    if !bbox_output.status.success() {
        return Err(format!(
            "pdftotext bbox inspection failed: {}",
            String::from_utf8_lossy(&bbox_output.stderr)
        ));
    }

    let bbox = fs::read_to_string(&bbox_path)
        .await
        .map_err(|error| format!("failed to read PDF geometry: {error}"))?;
    let _ = fs::remove_file(&bbox_path).await;

    Ok(PdfInspection {
        pages,
        fill_ratio: last_page_fill_ratio(&bbox).unwrap_or_default(),
        text: String::from_utf8_lossy(&text_output.stdout).into_owned(),
    })
}

fn validate_pdf_contents(
    document: &CvRenderRequest,
    inspection: &PdfInspection,
) -> Result<(), String> {
    let normalized = normalize_text(&inspection.text);

    for heading in [
        "SUMMARY",
        "SKILLS",
        "EXPERIENCE",
        "PROJECTS",
        "CERTIFICATIONS",
        "EDUCATION",
    ] {
        if !normalized.contains(&normalize_text(heading)) {
            return Err(format!("required section missing from PDF: {heading}"));
        }
    }

    for experience in &document.experiences {
        ensure_text_present(&normalized, &experience.title, "experience")?;
    }
    for project in &document.projects {
        ensure_text_present(&normalized, &project.title, "project")?;
    }
    for certification in &document.certifications {
        ensure_text_present(&normalized, &certification.title, "certification")?;
    }
    for education in &document.education_lines {
        ensure_text_present(&normalized, education, "education")?;
    }

    Ok(())
}

fn ensure_text_present(normalized_pdf: &str, value: &str, label: &str) -> Result<(), String> {
    let normalized_value = normalize_text(value);
    if normalized_value.is_empty() || normalized_pdf.contains(&normalized_value) {
        return Ok(());
    }

    Err(format!("{label} content missing from final PDF: {value}"))
}

fn normalize_text(value: &str) -> String {
    value
        .replace(['—', '–'], "-")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase()
}

fn last_page_fill_ratio(bbox: &str) -> Option<f64> {
    let last_page_start = bbox.rfind("<page ")?;
    let page = &bbox[last_page_start..];
    let page_height = parse_attribute(page, "height")?;

    let mut max_y = 0.0_f64;
    let mut rest = page;
    while let Some(index) = rest.find("yMax=\"") {
        rest = &rest[index + 6..];
        let end = rest.find('"')?;
        if let Ok(value) = rest[..end].parse::<f64>() {
            max_y = max_y.max(value);
        }
        rest = &rest[end + 1..];
    }

    (page_height > 0.0 && max_y > 0.0).then_some(max_y / page_height)
}

fn parse_attribute(source: &str, attribute: &str) -> Option<f64> {
    let needle = format!("{attribute}=\"");
    let start = source.find(&needle)? + needle.len();
    let rest = &source[start..];
    let end = rest.find('"')?;
    rest[..end].parse::<f64>().ok()
}

fn trim_lowest_priority_optional_item(document: &mut CvRenderRequest, profile: &CvProfile) -> bool {
    if document.certifications.len() > profile.layout_policy.minimum_items.certifications {
        document.certifications.pop();
        return true;
    }
    if document.projects.len() > profile.layout_policy.minimum_items.projects {
        document.projects.pop();
        return true;
    }
    if document.experiences.len() > profile.layout_policy.minimum_items.experiences {
        document.experiences.pop();
        return true;
    }

    false
}

async fn cleanup_attempt(html_path: &str, pdf_path: &str, profile_path: &str) {
    let _ = fs::remove_file(html_path).await;
    let _ = fs::remove_file(pdf_path).await;
    let _ = fs::remove_dir_all(profile_path).await;
}

fn unique_suffix() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|value| value.as_nanos())
        .unwrap_or_default()
}

fn standalone_project_html(project: &ProjectSection) -> String {
    format!(
        r#"
        <article class="project">
          <div class="item-heading">
            <span class="item-title">{title}</span>
            <span class="item-meta">{kind} | {meta}</span>
          </div>
          <p class="project-narrative">{narrative}</p>
          <div class="project-tech"><strong>Tech stack:</strong> {tech_stack}</div>
        </article>
        "#,
        title = escape(&project.title),
        kind = escape(&project.kind),
        meta = linkify_meta(&project.meta),
        narrative = escape(&project.narrative),
        tech_stack = escape(&project.tech_stack),
    )
}

/// Escapes a meta line and turns each part that looks like a web address into a link, so a domain printed in
/// the CV can be clicked.
fn linkify_meta(meta: &str) -> String {
    meta.split(" | ")
        .map(|part| {
            let is_address = !part.contains(char::is_whitespace)
                && part.contains('.')
                && part.chars().any(|ch| ch.is_ascii_alphabetic());

            if is_address {
                format!(
                    r#"<a href="https://{href}">{text}</a>"#,
                    href = escape(part),
                    text = escape(part)
                )
            } else {
                escape(part)
            }
        })
        .collect::<Vec<_>>()
        .join(" | ")
}

fn experience_html(experience: &ExperienceSection) -> String {
    let related_projects = if experience.related_projects.is_empty() || experience.kind == "program"
    {
        String::new()
    } else {
        let links = experience
            .related_projects
            .iter()
            .map(|project| {
                format!(
                    r#"<a href="{url}">{title}</a>"#,
                    url = escape(&project.url),
                    title = escape(&project.title),
                )
            })
            .collect::<Vec<_>>()
            .join(", ");

        format!(
            r#"<div class="related-projects"><strong>Related projects:</strong> {links}</div>"#,
            links = links
        )
    };

    let bullets = if experience.bullets.is_empty() {
        String::new()
    } else {
        format!(
            r#"<div class="bullets">{}</div>"#,
            experience
                .bullets
                .iter()
                .map(|bullet| format!(r#"<div class="bullet">• {}</div>"#, escape(bullet)))
                .collect::<Vec<_>>()
                .join("")
        )
    };

    format!(
        r#"
        <article class="experience">
          <div class="item-heading">
            <span class="item-title">{title}</span>
            <span class="item-meta">{meta}</span>
          </div>
          {summary}
          {related_projects}
          {bullets}
        </article>
        "#,
        title = escape(&experience.title),
        meta = escape(&experience.meta),
        summary = if experience.summary.trim().is_empty() {
            String::new()
        } else {
            format!(
                r#"<p class="experience-summary">{}</p>"#,
                escape(&experience.summary)
            )
        },
        related_projects = related_projects,
        bullets = bullets,
    )
}

fn certification_html(certification: &CertificationSection) -> String {
    format!(
        r#"
        <div class="certification">
          <a class="cert-title" href="{url}">{title}</a>
          <span class="cert-meta">{meta}</span>
        </div>
        "#,
        url = escape(&certification.url),
        title = escape(&certification.title),
        meta = escape(&certification.meta),
    )
}

fn section(title: &str, body: &str) -> String {
    section_with_class(title, body, "section")
}

/// A section that always starts on a new page, so the CV breaks between sections instead of inside one.
fn section_on_new_page(title: &str, body: &str) -> String {
    section_with_class(title, body, "section new-page")
}

fn section_with_class(title: &str, body: &str, class: &str) -> String {
    if body.trim().is_empty() {
        return String::new();
    }

    format!(
        r#"
        <section class="{class}">
          <div class="section-title">{title}</div>
          {body}
        </section>
        "#,
        class = class,
        title = escape(title),
        body = body,
    )
}

fn render_html(document: &CvRenderRequest, profile: DensityProfile) -> String {
    let scopes = document
        .technical_scope
        .iter()
        .map(|line| {
            format!(
                r#"<div class="skill-line"><strong class="skill-label">{}:</strong> <span class="skill-value">{}</span></div>"#,
                escape(&line.label),
                escape(&line.text)
            )
        })
        .collect::<Vec<_>>()
        .join("");

    let experiences = document
        .experiences
        .iter()
        .map(experience_html)
        .collect::<Vec<_>>()
        .join("");

    let projects = document
        .projects
        .iter()
        .map(standalone_project_html)
        .collect::<Vec<_>>()
        .join("");

    let certifications = document
        .certifications
        .iter()
        .map(certification_html)
        .collect::<Vec<_>>()
        .join("");

    let education = document
        .education_lines
        .iter()
        .map(|line| format!(r#"<div class="education">{}</div>"#, escape(line)))
        .collect::<Vec<_>>()
        .join("");

    format!(
        r#"<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>{name} - CV</title>
<style>
  @page {{
    size: A4;
    margin: {vertical_margin}in {horizontal_margin}in;
  }}

  * {{ box-sizing: border-box; }}

  html, body {{
    margin: 0;
    padding: 0;
    background: white;
  }}

  body {{
    font-family: Arial, "Liberation Sans", sans-serif;
    color: #111111;
    font-size: {body_size}pt;
    line-height: {line_height};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  header {{
    break-inside: avoid-page;
  }}

  h1 {{
    margin: 0;
    font-size: 20pt;
    line-height: 1.05;
    font-weight: 700;
  }}

  .headline {{
    margin-top: 5px;
    font-size: 11pt;
    font-weight: 700;
  }}

  .contact a {{ color: inherit; text-decoration: none; }}

  .contact {{
    margin-top: 5px;
    color: #444444;
    font-size: 10pt;
    line-height: 1.35;
  }}

  .section {{
    margin-top: {section_gap}px;
  }}

  .new-page {{
    break-before: page;
    page-break-before: always;
    margin-top: 0;
  }}

  .section-title {{
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 1px solid #666666;
    padding-bottom: 2px;
    margin-bottom: 5px;
    break-after: avoid-page;
    page-break-after: avoid;
  }}

  .summary,
  .experience-summary,
  .project-narrative {{
    margin: 0;
    text-align: justify;
    text-align-last: start;
    hyphens: none;
    orphans: 3;
    widows: 3;
  }}

  .project-tech {{
    margin-top: 1px;
    font-size: 10pt;
    line-height: 1.0;
  }}

  .skills {{ display: block; }}

  .skill-line {{
    padding: 1px 0;
    break-inside: avoid;
  }}

  .skill-label {{ font-weight: 700; }}

  .experience,
  .project,
  .certification,
  .education {{
    break-inside: avoid-page;
    page-break-inside: avoid;
  }}

  .experience,
  .project {{
    margin: 0 0 {item_gap}px;
  }}

  .item-heading {{
    line-height: 1.25;
    margin-bottom: 2px;
  }}

  .item-title {{
    font-weight: 700;
    color: #111111;
  }}

  .item-meta,
  .cert-meta {{
    color: #444444;
    font-size: 10pt;
  }}

  .item-meta a {{
    color: #111111;
    text-decoration: underline;
    text-decoration-thickness: 0.5px;
    text-underline-offset: 1px;
  }}

  .item-meta::before,
  .cert-meta::before {{
    content: " | ";
  }}

  .bullets {{ margin: 3px 0 0; }}

  .bullet {{
    margin: 0 0 {bullet_gap}px;
    padding-left: 1em;
    text-indent: -1em;
    text-align: justify;
    text-align-last: start;
    hyphens: none;
    orphans: 3;
    widows: 3;
  }}

  .related-projects {{
    margin-top: 2px;
    color: #444444;
  }}

  .related-projects a {{
    color: #111111;
    text-decoration: underline;
    text-decoration-thickness: 0.5px;
    text-underline-offset: 1px;
  }}

  .cert-list {{
    display: block;
  }}

  .certification {{
    font-size: 10pt;
    line-height: {{line_height}};
  }}

  .cert-title {{
    color: #111111;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 0.5px;
    text-underline-offset: 1px;
  }}

  .education {{
    margin-bottom: 2px;
  }}
</style>
</head>
<body>
  <header>
    <h1>{name_upper}</h1>
    <div class="headline">{headline}</div>
    <div class="contact">{contact}</div>
  </header>

  {summary_section}
  {skills_section}
  {experience_section}
  {projects_section}
  {education_section}
  {certifications_section}
</body>
</html>"#,
        name = escape(&document.name),
        name_upper = escape(&document.name.to_uppercase()),
        headline = escape(&document.headline),
        contact = escape(&document.contact).replace(
            "Portfolio: https://farismnrr.com",
            r#"Portfolio: <a href="https://farismnrr.com">https://farismnrr.com</a>"#,
        ),
        summary_section = section(
            "Summary",
            &format!(
                r#"<p class="summary">{}</p>"#,
                escape(&document.profile_summary)
            ),
        ),
        skills_section = section("Skills", &format!(r#"<div class="skills">{scopes}</div>"#)),
        experience_section = section("Experience", &experiences),
        projects_section = section_on_new_page("Projects", &projects),
        certifications_section = section(
            "Certifications",
            &format!(r#"<div class="cert-list">{certifications}</div>"#),
        ),
        education_section = section("Education", &education),
        body_size = profile.body_size,
        line_height = profile.line_height,
        section_gap = profile.section_gap,
        item_gap = profile.item_gap,
        bullet_gap = profile.bullet_gap,
        horizontal_margin = profile.horizontal_margin,
        vertical_margin = profile.vertical_margin,
    )
}

fn escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[cfg(test)]
mod tests {
    use super::{last_page_fill_ratio, CvRenderRequest};
    use crate::profiles;

    #[tokio::test]
    #[ignore = "requires Chromium and an evidence-backed CV_RENDER_FIXTURE"]
    async fn renders_current_cv_fixture() {
        let fixture = std::env::var("CV_RENDER_FIXTURE").expect("fixture path");
        let output = std::env::var("CV_RENDER_OUTPUT").expect("output path");
        let request: CvRenderRequest =
            serde_json::from_slice(&tokio::fs::read(fixture).await.unwrap()).unwrap();
        assert_eq!(
            request
                .experiences
                .iter()
                .filter(|item| item.kind == "employment")
                .count(),
            1
        );
        assert_eq!(
            request
                .experiences
                .iter()
                .filter(|item| item.kind == "program")
                .count(),
            4
        );
        assert!(!request
            .experiences
            .iter()
            .any(|item| item.title.contains("Codepolitan")));
        assert_eq!(request.projects.len(), 5);
        let candidate = super::render_validated_pdf(request, profiles::get("general").unwrap())
            .await
            .unwrap();
        tokio::fs::write(output, candidate.bytes).await.unwrap();
    }

    #[test]
    fn accepts_frontend_camel_case_render_payload() {
        let payload = serde_json::json!({
            "contractVersion": "cv-contract/v1",
            "profileId": "general",
            "name": "Faris Munir Mahdi",
            "headline": "Software Engineer",
            "contact": "farismnrr.com",
            "profileSummary": "General software engineering profile.",
            "technicalScope": [
                { "label": "Software Engineering", "text": "Rust, Go, TypeScript" }
            ],
            "projects": [
                {
                    "title": "Sensio Notes",
                    "kind": "Professional",
                    "meta": "PT Perkasa Pilar Utama | 2026",
                    "narrative": "Grounded project narrative.",
                    "techStack": "React, NestJS, PostgreSQL",
                    "url": "https://farismnrr.com/projects"
                }
            ],
            "experiences": [
                {
                    "title": "Backend Developer | PT Perkasa Pilar Utama",
                    "meta": "July 2025 - Present | Jakarta",
                    "summary": "Backend, IoT, and product engineering.",
                    "relatedProjects": [
                        {
                            "title": "Sensio Notes",
                            "url": "https://farismnrr.com/projects"
                        }
                    ],
                    "bullets": []
                }
            ],
            "certifications": [
                {
                    "title": "Example Certification",
                    "meta": "Example Issuer | 2026",
                    "url": "https://farismnrr.com/certifications/example"
                }
            ],
            "educationLines": [
                "UPN Veteran East Java | Bachelor of Computer Science | 2020 - 2024"
            ],
            "maxPages": 2
        });

        serde_json::from_value::<CvRenderRequest>(payload)
            .expect("frontend CV render payload should deserialize");
    }

    #[test]
    fn projects_section_starts_on_a_new_page() {
        let html = super::section_on_new_page("Projects", "<p>x</p>");
        assert!(html.contains(r#"class="section new-page""#));
        assert!(super::section("Skills", "<p>x</p>").contains(r#"class="section""#));
    }

    #[test]
    fn measures_last_page_fill_from_bbox_output() {
        let bbox = r#"
            <page width="612.000000" height="792.000000">
              <word xMin="10" yMin="20" xMax="30" yMax="40">one</word>
            </page>
            <page width="612.000000" height="792.000000">
              <word xMin="10" yMin="600" xMax="30" yMax="650">two</word>
            </page>
        "#;

        let ratio = last_page_fill_ratio(bbox).expect("fill ratio");
        assert!((ratio - (650.0 / 792.0)).abs() < 0.0001);
    }

    #[test]
    fn profile_registry_drives_renderer_filename_and_page_budget() {
        let profile = profiles::get("general").expect("General profile");

        assert_eq!(profile.filename, "Faris_Munir_Mahdi_CV.pdf");
        assert_eq!(profile.max_pages, 2);
        assert!(profile.layout_policy.min_body_size_pt >= 10.5);
        assert_eq!(profile.layout_policy.minimum_items.projects, 5);
    }
}
