use std::{env, net::SocketAddr};

use axum::{
    body::Body,
    http::{header, StatusCode, Uri},
    response::{IntoResponse, Response},
    routing::post,
    Router,
};
use rust_embed::RustEmbed;
use tower_http::trace::TraceLayer;

mod ai;
mod cv;
mod rag;

#[derive(RustEmbed)]
#[folder = "../frontend/dist/"]
struct Assets;

fn asset_response(path: &str, bytes: Vec<u8>) -> Response {
    let mime = mime_guess::from_path(path).first_or_octet_stream();
    let cache_control = if path == "index.html" {
        "no-cache"
    } else if path.starts_with("assets/") {
        "public, max-age=31536000, immutable"
    } else {
        "public, max-age=3600"
    };

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime.as_ref())
        .header(header::CACHE_CONTROL, cache_control)
        .body(Body::from(bytes))
        .expect("valid embedded asset response")
}

async fn embedded_asset(uri: Uri) -> Response {
    let requested = uri.path().trim_start_matches('/');
    let path = if requested.is_empty() {
        "index.html"
    } else {
        requested
    };

    if let Some(asset) = Assets::get(path) {
        return asset_response(path, asset.data.into_owned());
    }

    if let Some(index) = Assets::get("index.html") {
        return asset_response("index.html", index.data.into_owned());
    }

    (
        StatusCode::INTERNAL_SERVER_ERROR,
        "embedded frontend is missing index.html",
    )
        .into_response()
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "portfolio_server=info,tower_http=info".into()),
        )
        .init();

    let ai_state = ai::AiState::from_env().expect("valid 9router configuration");
    let corpus = Assets::get("cv-corpus.json").expect("frontend build must include cv-corpus.json");
    let rag_state = rag::RagState::from_env(ai_state.clone(), corpus.data.as_ref())
        .expect("valid CV retrieval configuration");

    let ai_routes = Router::new()
        .route("/api/ai/chat", post(ai::chat))
        .with_state(ai_state);

    let rag_routes = Router::new()
        .route("/api/cv/retrieve", post(rag::retrieve))
        .with_state(rag_state);

    let app = Router::new()
        .merge(ai_routes)
        .merge(rag_routes)
        .route("/api/cv/render", post(cv::render))
        .fallback(embedded_asset)
        .layer(TraceLayer::new_for_http());

    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3000);

    let address = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("failed to bind server");

    tracing::info!("serving embedded portfolio on http://{address}");
    axum::serve(listener, app).await.expect("server error");
}
