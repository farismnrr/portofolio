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
    primary_experience: Option<ExperienceSection>,
    earlier_experience: String,
    education_line: String,
}

#[derive(Deserialize)]
pub struct ScopeLine {
    label: String,
    text: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSection {
    title: String,
    meta: String,
    narrative: String,
}

#[derive(Deserialize)]
pub struct ExperienceSection {
    title: String,
    narrative: String,
}

pub async fn render(Json(payload): Json<CvRenderRequest>) -> Response {
    if payload.name.trim().is_empty()
        || payload.profile_summary.trim().is_empty()
        || payload.projects.is_empty()
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

    let output = Command::new("chromium")
        .args([
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
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
                    "attachment; filename="Faris_Munir_Mahdi_CV.pdf"",
                )
                .header(header::CACHE_CONTROL, "no-store")
                .body(Body::from(bytes))
                .expect("valid PDF response"),
            Ok(_) => {
                tracing::error!("chromium generated an invalid PDF payload");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "invalid PDF generated",
                )
                    .into_response()
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
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to render CV PDF",
            )
                .into_response()
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
    response
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

    let projects = document
        .projects
        .iter()
        .take(4)
        .map(|project| {
            format!(
                r#"
                <article class="project">
                  <div class="project-title">{}</div>
                  <div class="project-meta">{}</div>
                  <p>{}</p>
                </article>
                "#,
                escape(&project.title),
                escape(&project.meta),
                escape(&project.narrative)
            )
        })
        .collect::<Vec<_>>()
        .join("");

    let primary_experience = document
        .primary_experience
        .as_ref()
        .map(|experience| {
            format!(
                r#"
                <div class="experience-primary">
                  <strong>{}</strong>
                  <span>{}</span>
                </div>
                "#,
                escape(&experience.title),
                escape(&experience.narrative)
            )
        })
        .unwrap_or_default();

    format!(
        r#"<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>{name} - CV</title>
<style>
  @page {{ size: Letter; margin: 0; }}
  :root {{
    --body-size: 9.05pt;
    --navy: #1d466f;
    --text: #111827;
    --muted: #525b67;
    --rule: #1d466f;
  }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; padding: 0; background: white; }}
  body {{
    font-family: Arial, "Liberation Sans", sans-serif;
    color: var(--text);
    font-size: var(--body-size);
    line-height: 1.22;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  .page {{
    width: 8.5in;
    height: 11in;
    padding: 0.46in 0.55in 0.40in;
    overflow: hidden;
  }}
  .content {{ height: 100%; overflow: hidden; }}
  h1 {{
    margin: 0;
    font-size: 19.2pt;
    line-height: 1;
    letter-spacing: -0.02em;
    font-weight: 700;
  }}
  .headline {{
    margin-top: 4px;
    font-size: 10.5pt;
    line-height: 1.12;
    font-weight: 700;
  }}
  .contact {{
    margin-top: 4px;
    color: var(--muted);
    font-size: 8.3pt;
    line-height: 1.15;
  }}
  .section {{ margin-top: 9px; }}
  .section-title {{
    color: var(--navy);
    font-size: 9.4pt;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    padding-bottom: 2px;
    border-bottom: 0.75px solid var(--rule);
    margin-bottom: 4px;
  }}
  p {{ margin: 0; }}
  .profile {{
    font-size: 8.8pt;
    line-height: 1.26;
  }}
  .scope {{
    margin: 1.2px 0;
    font-size: 8.45pt;
    line-height: 1.22;
  }}
  .project {{
    margin: 0 0 5.5px;
    break-inside: avoid;
    page-break-inside: avoid;
  }}
  .project-title {{
    font-weight: 700;
    font-size: 9.15pt;
    line-height: 1.12;
    display: inline;
  }}
  .project-meta {{
    display: inline;
    color: var(--muted);
    font-size: 8.05pt;
  }}
  .project-meta::before {{ content: " | "; }}
  .project p {{
    margin-top: 1px;
    font-size: 8.55pt;
    line-height: 1.24;
  }}
  .experience-primary {{
    font-size: 8.55pt;
    line-height: 1.25;
  }}
  .experience-primary strong {{
    display: block;
    font-size: 8.85pt;
    margin-bottom: 1px;
  }}
  .earlier {{
    margin-top: 2px;
    font-size: 8.35pt;
    line-height: 1.22;
    color: #252b33;
  }}
  .education {{
    font-size: 8.55pt;
    line-height: 1.2;
  }}
</style>
</head>
<body>
  <main class="page">
    <div class="content" id="content">
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
        {projects}
      </section>

      <section class="section">
        <div class="section-title">Experience</div>
        {primary_experience}
        <div class="earlier">{earlier}</div>
      </section>

      <section class="section">
        <div class="section-title">Education</div>
        <div class="education">{education}</div>
      </section>
    </div>
  </main>
<script>
(() => {{
  const content = document.getElementById('content');
  let size = 9.05;
  while (content.scrollHeight > content.clientHeight && size > 7.75) {{
    size -= 0.08;
    document.documentElement.style.setProperty('--body-size', size.toFixed(2) + 'pt');
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
        projects = projects,
        primary_experience = primary_experience,
        earlier = escape(&document.earlier_experience),
        education = escape(&document.education_line),
    )
}

fn escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace(''', "&#39;")
}
