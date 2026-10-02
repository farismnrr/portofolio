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
pub struct ExperienceSection {
    title: String,
    meta: String,
    narrative: String,
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
        || payload.projects.is_empty()
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

fn project_html(project: &ProjectSection) -> String {
    format!(
        r#"
        <article class="project">
          <div class="item-heading">
            <a class="item-title" href="{url}">{title}</a>
            <span class="item-meta">{meta}</span>
          </div>
          <p>{narrative}</p>
        </article>
        "#,
        url = escape(&project.url),
        title = escape(&project.title),
        meta = escape(&project.meta),
        narrative = escape(&project.narrative),
    )
}

fn experience_html(experience: &ExperienceSection) -> String {
    format!(
        r#"
        <article class="experience">
          <div class="item-heading">
            <span class="item-title">{title}</span>
            <span class="item-meta">{meta}</span>
          </div>
          <p>{narrative}</p>
        </article>
        "#,
        title = escape(&experience.title),
        meta = escape(&experience.meta),
        narrative = escape(&experience.narrative),
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

fn render_html(document: &CvRenderRequest) -> String {
    let scopes = document
        .technical_scope
        .iter()
        .map(|line| {
            format!(
                r#"<div class="scope"><strong>{}:</strong> {}</div>"#,
                escape(&line.label),
                escape(&line.text)
            )
        })
        .collect::<Vec<_>>()
        .join("");

    let project_split = if document.max_pages > 1 {
        document.projects.len().min(3)
    } else {
        document.projects.len()
    };
    let (first_projects, second_projects) = document.projects.split_at(project_split);

    let first_projects = first_projects
        .iter()
        .map(project_html)
        .collect::<Vec<_>>()
        .join("");

    let second_projects = second_projects
        .iter()
        .map(project_html)
        .collect::<Vec<_>>()
        .join("");

    let experiences = document
        .experiences
        .iter()
        .map(experience_html)
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

    let second_page = if document.max_pages > 1 {
        format!(
            r#"
            <main class="page page-two">
              <div class="page-content fit-page">
                {continued_projects}
                <section class="section">
                  <div class="section-title">Experience</div>
                  {experiences}
                </section>
                <section class="section">
                  <div class="section-title">Certifications</div>
                  <div class="cert-list">{certifications}</div>
                </section>
                <section class="section">
                  <div class="section-title">Education</div>
                  {education}
                </section>
              </div>
            </main>
            "#,
            continued_projects = if second_projects.is_empty() {
                String::new()
            } else {
                format!(
                    r#"<section class="section first-section">
                         <div class="section-title">Selected Projects — Continued</div>
                         {second_projects}
                       </section>"#
                )
            },
            experiences = experiences,
            certifications = certifications,
            education = education,
        )
    } else {
        String::new()
    };

    let one_page_tail = if document.max_pages <= 1 {
        format!(
            r#"
            <section class="section">
              <div class="section-title">Experience</div>
              {experiences}
            </section>
            <section class="section">
              <div class="section-title">Certifications</div>
              <div class="cert-list">{certifications}</div>
            </section>
            <section class="section">
              <div class="section-title">Education</div>
              {education}
            </section>
            "#,
            experiences = experiences,
            certifications = certifications,
            education = education,
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
    --navy: #1d466f;
    --text: #151a22;
    --muted: #56606d;
    --rule: #1d466f;
    --page-font-size: 9.35pt;
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
    line-height: 1.38;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .page {{
    width: 8.5in;
    height: 11in;
    padding: 0.52in 0.62in 0.48in;
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
    font-size: 20.5pt;
    line-height: 1.05;
    letter-spacing: -0.018em;
    font-weight: 700;
  }}

  .headline {{
    margin-top: 6px;
    font-size: 10.8pt;
    line-height: 1.22;
    font-weight: 700;
  }}

  .contact {{
    margin-top: 5px;
    color: var(--muted);
    font-size: 8.6pt;
    line-height: 1.3;
  }}

  .section {{
    margin-top: 13px;
  }}

  .first-section {{
    margin-top: 0;
  }}

  .section-title {{
    color: var(--navy);
    font-size: 9.8pt;
    font-weight: 700;
    letter-spacing: 0.015em;
    text-transform: uppercase;
    padding-bottom: 3px;
    border-bottom: 0.8px solid var(--rule);
    margin-bottom: 7px;
  }}

  p {{
    margin: 0;
  }}

  .profile {{
    font-size: 9.15pt;
    line-height: 1.46;
  }}

  .scope {{
    margin: 3px 0;
    font-size: 8.95pt;
    line-height: 1.4;
  }}

  .project,
  .experience {{
    margin: 0 0 10px;
    break-inside: avoid;
    page-break-inside: avoid;
  }}

  .item-heading {{
    line-height: 1.22;
  }}

  .item-title,
  .cert-title {{
    color: var(--text);
    font-weight: 700;
    text-decoration: none;
  }}

  a.item-title,
  a.cert-title {{
    color: var(--navy);
  }}

  .item-title {{
    font-size: 9.5pt;
  }}

  .item-meta {{
    color: var(--muted);
    font-size: 8.35pt;
  }}

  .item-meta::before {{
    content: " | ";
  }}

  .project p,
  .experience p {{
    margin-top: 3px;
    font-size: 8.95pt;
    line-height: 1.43;
  }}

  .cert-list {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 18px;
    row-gap: 7px;
  }}

  .certification {{
    break-inside: avoid;
    page-break-inside: avoid;
    font-size: 8.75pt;
    line-height: 1.32;
  }}

  .cert-meta {{
    color: var(--muted);
    font-size: 8.15pt;
  }}

  .cert-meta::before {{
    content: " | ";
  }}

  .education {{
    font-size: 8.9pt;
    line-height: 1.4;
    margin-bottom: 4px;
  }}
</style>
</head>
<body>
  <main class="page page-one">
    <div class="page-content fit-page">
      <header>
        <h1>{name_upper}</h1>
        <div class="headline">{headline}</div>
        <div class="contact">{contact}</div>
      </header>

      <section class="section">
        <div class="section-title">Profile</div>
        <p class="profile">{profile}</p>
      </section>

      <section class="section">
        <div class="section-title">Technical Scope</div>
        {scopes}
      </section>

      <section class="section">
        <div class="section-title">Selected Projects</div>
        {first_projects}
      </section>

      {one_page_tail}
    </div>
  </main>

  {second_page}

<script>
(() => {{
  for (const page of document.querySelectorAll('.fit-page')) {{
    let size = 9.35;
    while (page.scrollHeight > page.clientHeight && size > 8.25) {{
      size -= 0.06;
      page.style.fontSize = size.toFixed(2) + 'pt';
    }}
  }}
}})();
</script>
</body>
</html>"#,
        name = escape(&document.name),
        name_upper = escape(&document.name.to_uppercase()),
        headline = escape(&document.headline),
        contact = escape(&document.contact),
        profile = escape(&document.profile_summary),
        scopes = scopes,
        first_projects = first_projects,
        one_page_tail = one_page_tail,
        second_page = second_page,
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
