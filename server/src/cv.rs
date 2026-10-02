use std::time::{SystemTime, UNIX_EPOCH};

use axum::{
    body::Body,
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use tokio::{fs, process::Command};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CvRenderRequest {
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

#[derive(Deserialize)]
pub struct ScopeLine {
    label: String,
    text: String,
}

#[derive(Deserialize)]
pub struct ProjectSection {
    title: String,
    meta: String,
    narrative: String,
    url: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExperienceSection {
    title: String,
    meta: String,
    summary: String,
    related_projects: Vec<ProjectReference>,
    bullets: Vec<String>,
}

#[derive(Deserialize)]
pub struct ProjectReference {
    title: String,
    url: String,
}

#[derive(Deserialize)]
pub struct CertificationSection {
    title: String,
    meta: String,
    url: String,
}

pub async fn render(Json(payload): Json<CvRenderRequest>) -> Response {
    if payload.name.trim().is_empty()
        || payload.profile_summary.trim().is_empty()
        || payload.experiences.is_empty()
    {
        return (
            StatusCode::BAD_REQUEST,
            "CV document is missing required content",
        )
            .into_response();
    }

    let html = render_html(&payload);
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|value| value.as_nanos())
        .unwrap_or_default();
    let html_path = format!("/tmp/portfolio-cv-{suffix}.html");
    let pdf_path = format!("/tmp/portfolio-cv-{suffix}.pdf");

    if let Err(error) = fs::write(&html_path, html).await {
        tracing::error!(%error, "failed to write temporary CV HTML");
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "failed to prepare CV document",
        )
            .into_response();
    }

    let profile_path = format!("/tmp/chromium-profile-{suffix}");

    let output = Command::new("chromium")
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
        .await;

    let response = match output {
        Ok(output) if output.status.success() => match fs::read(&pdf_path).await {
            Ok(bytes) if bytes.starts_with(b"%PDF") => Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/pdf")
                .header(
                    header::CONTENT_DISPOSITION,
                    "attachment; filename=\"Faris_Munir_Mahdi_CV.pdf\"",
                )
                .header(header::CACHE_CONTROL, "no-store")
                .body(Body::from(bytes))
                .expect("valid PDF response"),
            Ok(_) => {
                tracing::error!("chromium generated an invalid PDF payload");
                (StatusCode::INTERNAL_SERVER_ERROR, "invalid PDF generated").into_response()
            }
            Err(error) => {
                tracing::error!(%error, "failed to read generated CV PDF");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "failed to read generated PDF",
                )
                    .into_response()
            }
        },
        Ok(output) => {
            tracing::error!(
                status = ?output.status.code(),
                stderr = %String::from_utf8_lossy(&output.stderr),
                "chromium failed to render CV"
            );
            (StatusCode::INTERNAL_SERVER_ERROR, "failed to render CV PDF").into_response()
        }
        Err(error) => {
            tracing::error!(%error, "failed to launch chromium");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "PDF renderer unavailable",
            )
                .into_response()
        }
    };

    let _ = fs::remove_file(&html_path).await;
    let _ = fs::remove_file(&pdf_path).await;
    let _ = fs::remove_dir_all(&profile_path).await;
    response
}

fn standalone_project_html(project: &ProjectSection) -> String {
    format!(
        r#"
        <article class="project">
          <div class="item-heading">
            <a class="item-title" href="{url}">{title}</a>
            <span class="item-meta">{meta}</span>
          </div>
          <ul class="bullets">
            <li>{narrative}</li>
          </ul>
        </article>
        "#,
        url = escape(&project.url),
        title = escape(&project.title),
        meta = escape(&project.meta),
        narrative = escape(&project.narrative),
    )
}

fn experience_html(experience: &ExperienceSection) -> String {
    let related_projects = if experience.related_projects.is_empty() {
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
            r#"<ul class="bullets">{}</ul>"#,
            experience
                .bullets
                .iter()
                .map(|bullet| format!("<li>{}</li>", escape(bullet)))
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
          <p class="experience-summary">{summary}</p>
          {related_projects}
          {bullets}
        </article>
        "#,
        title = escape(&experience.title),
        meta = escape(&experience.meta),
        summary = escape(&experience.summary),
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

fn section(title: &str, body: &str, first: bool) -> String {
    if body.trim().is_empty() {
        return String::new();
    }

    let first_class = if first { " first-section" } else { "" };
    format!(
        r#"
        <section class="section{first_class}">
          <div class="section-title">{title}</div>
          {body}
        </section>
        "#,
        first_class = first_class,
        title = escape(title),
        body = body,
    )
}

fn render_html(document: &CvRenderRequest) -> String {
    let scopes = document
        .technical_scope
        .iter()
        .map(|line| {
            format!(
                r#"<div class="skill-line"><strong>{}:</strong> {}</div>"#,
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
        .collect::<Vec<_>>();

    let experience_split = if document.max_pages > 1 {
        experiences.len().min(2)
    } else {
        experiences.len()
    };
    let (first_experiences, second_experiences) = experiences.split_at(experience_split);
    let first_experiences = first_experiences.join("");
    let second_experiences = second_experiences.join("");

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

    let page_one = format!(
        r#"
        <main class="page page-one">
          <div class="page-content fit-page">
            <header>
              <h1>{name_upper}</h1>
              <div class="headline">{headline}</div>
              <div class="contact">{contact}</div>
            </header>

            {summary_section}
            {skills_section}
            {experience_section}
            {one_page_tail}
          </div>
        </main>
        "#,
        name_upper = escape(&document.name.to_uppercase()),
        headline = escape(&document.headline),
        contact = escape(&document.contact),
        summary_section = section(
            "Professional Summary",
            &format!(
                r#"<p class="summary">{}</p>"#,
                escape(&document.profile_summary)
            ),
            false,
        ),
        skills_section = section("Skills", &scopes, false),
        experience_section = section("Work Experience", &first_experiences, false),
        one_page_tail = if document.max_pages <= 1 {
            format!(
                "{}{}{}",
                section("Projects", &projects, false),
                section(
                    "Certifications",
                    &format!(r#"<div class="cert-list">{certifications}</div>"#),
                    false,
                ),
                section("Education", &education, false),
            )
        } else {
            String::new()
        },
    );

    let page_two = if document.max_pages > 1 {
        format!(
            r#"
            <main class="page page-two">
              <div class="page-content fit-page">
                {experience_continued}
                {projects_section}
                {certifications_section}
                {education_section}
              </div>
            </main>
            "#,
            experience_continued = section("Work Experience", &second_experiences, true),
            projects_section = section("Projects", &projects, second_experiences.is_empty()),
            certifications_section = section(
                "Certifications",
                &format!(r#"<div class="cert-list">{certifications}</div>"#),
                second_experiences.is_empty() && projects.is_empty(),
            ),
            education_section = section(
                "Education",
                &education,
                second_experiences.is_empty() && projects.is_empty() && certifications.is_empty(),
            ),
        )
    } else {
        String::new()
    };

    format!(
        r#"<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>{name} - CV</title>
<style>
  @page {{ size: Letter; margin: 0; }}

  :root {{
    --text: #111111;
    --muted: #444444;
    --rule: #666666;
    --page-font-size: 10pt;
  }}

  * {{ box-sizing: border-box; }}

  html, body {{
    margin: 0;
    padding: 0;
    background: white;
  }}

  body {{
    font-family: Arial, "Liberation Sans", sans-serif;
    color: var(--text);
    font-size: var(--page-font-size);
    line-height: 1.42;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .page {{
    width: 8.5in;
    height: 11in;
    padding: 0.52in 0.62in 0.50in;
    break-after: page;
    page-break-after: always;
    overflow: hidden;
  }}

  .page:last-child {{
    break-after: auto;
    page-break-after: auto;
  }}

  .page-content {{
    height: 100%;
    overflow: hidden;
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

  .contact {{
    margin-top: 5px;
    color: var(--muted);
    font-size: 9pt;
    line-height: 1.35;
  }}

  .section {{
    margin-top: 15px;
  }}

  .first-section {{
    margin-top: 0;
  }}

  .section-title {{
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 3px;
    margin-bottom: 8px;
  }}

  .summary {{
    margin: 0;
    font-size: 9.8pt;
    line-height: 1.48;
    text-align: justify;
    text-justify: inter-word;
  }}

  .skill-line {{
    margin: 3px 0;
    font-size: 9.6pt;
    line-height: 1.4;
  }}

  .experience,
  .project {{
    margin: 0 0 13px;
    break-inside: avoid;
    page-break-inside: avoid;
  }}

  .item-heading {{
    line-height: 1.28;
    margin-bottom: 4px;
  }}

  .item-title {{
    font-size: 10pt;
    font-weight: 700;
  }}

  .item-meta,
  .project-meta,
  .cert-meta {{
    color: var(--muted);
    font-size: 9pt;
  }}

  .item-meta::before,
  .project-meta::before,
  .cert-meta::before {{
    content: " | ";
  }}

  .bullets {{
    margin: 5px 0 0 18px;
    padding: 0;
  }}

  .bullets li {{
    margin: 0 0 5px;
    padding-left: 2px;
    font-size: 9.5pt;
    line-height: 1.45;
    text-align: justify;
    text-justify: inter-word;
  }}

  .item-title,
  .project-link {{
    color: var(--text);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 0.5px;
    text-underline-offset: 1px;
  }}

  .project-link {{
    font-size: 9.5pt;
  }}

  .experience-summary {{
    margin: 5px 0 0;
    font-size: 9.45pt;
    line-height: 1.46;
    text-align: justify;
    text-justify: inter-word;
  }}

  .related-projects {{
    margin-top: 5px;
    font-size: 9pt;
    line-height: 1.4;
    color: var(--muted);
  }}

  .related-projects a {{
    color: var(--text);
    text-decoration: underline;
    text-decoration-thickness: 0.5px;
    text-underline-offset: 1px;
  }}

  .cert-list {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 22px;
    row-gap: 10px;
  }}

  .certification {{
    break-inside: avoid;
    page-break-inside: avoid;
    font-size: 8.75pt;
    line-height: 1.42;
    padding-bottom: 2px;
  }}

  .cert-title {{
    color: #1d466f;
    font-weight: 700;
    text-decoration: none;
  }}

  .education {{
    font-size: 9.5pt;
    line-height: 1.42;
    margin-bottom: 5px;
  }}
</style>
</head>
<body>
  {page_one}
  {page_two}

<script>
(() => {{
  for (const page of document.querySelectorAll('.fit-page')) {{
    let size = 10;
    while (page.scrollHeight > page.clientHeight && size > 8.6) {{
      size -= 0.06;
      page.style.fontSize = size.toFixed(2) + 'pt';
    }}
  }}
}})();
</script>
</body>
</html>"#,
        name = escape(&document.name),
        page_one = page_one,
        page_two = page_two,
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
    use super::CvRenderRequest;

    #[test]
    fn accepts_frontend_camel_case_render_payload() {
        let payload = serde_json::json!({
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
                    "meta": "PT Perkasa Pilar Utama | 2026",
                    "narrative": "Grounded project narrative.",
                    "url": "https://farismnrr.com/projects/sensio-notes"
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
                            "url": "https://farismnrr.com/projects/sensio-notes"
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
}
