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
mod profiles;
mod rag;

#[derive(RustEmbed)]
#[folder = "../frontend/dist/"]
struct Assets;

fn asset_response_with_status(path: &str, bytes: Vec<u8>, status: StatusCode) -> Response {
    let mime = mime_guess::from_path(path).first_or_octet_stream();
    let cache_control = if path == "index.html"
        || path.ends_with("/index.html")
        || status == StatusCode::NOT_FOUND
    {
        "no-cache"
    } else if path.starts_with("assets/") {
        "public, max-age=31536000, immutable"
    } else {
        "public, max-age=3600"
    };

    Response::builder()
        .status(status)
        .header(header::CONTENT_TYPE, mime.as_ref())
        .header(header::CACHE_CONTROL, cache_control)
        .header("content-language", "en")
        .header("x-content-type-options", "nosniff")
        .body(Body::from(bytes))
        .expect("valid embedded asset response")
}

fn asset_response(path: &str, bytes: Vec<u8>) -> Response {
    asset_response_with_status(path, bytes, StatusCode::OK)
}

fn route_exists(path: &str) -> bool {
    Assets::get("routes.txt")
        .and_then(|asset| String::from_utf8(asset.data.into_owned()).ok())
        .is_some_and(|routes| routes.lines().any(|route| route == path))
}

fn redirect_response(location: &str) -> Response {
    Response::builder()
        .status(StatusCode::PERMANENT_REDIRECT)
        .header(header::LOCATION, location)
        .header(header::CACHE_CONTROL, "public, max-age=3600")
        .body(Body::empty())
        .expect("valid redirect response")
}

async fn embedded_asset(uri: Uri) -> Response {
    let uri_path = uri.path();

    if uri_path == "/index.html" {
        return redirect_response("/");
    }

    if uri_path.len() > 1 && uri_path.ends_with('/') {
        let normalized = uri_path.trim_end_matches('/');
        if route_exists(normalized) {
            let location = match uri.query() {
                Some(query) => format!("{normalized}?{query}"),
                None => normalized.to_owned(),
            };
            return redirect_response(&location);
        }
    }

    let requested = uri_path.trim_start_matches('/');
    let asset_path = if requested.is_empty() {
        "index.html"
    } else {
        requested
    };

    if let Some(asset) = Assets::get(asset_path) {
        return asset_response(asset_path, asset.data.into_owned());
    }

    if route_exists(uri_path) {
        let prerendered_path = if requested.is_empty() {
            "index.html".to_owned()
        } else {
            format!("{requested}/index.html")
        };

        if let Some(document) = Assets::get(&prerendered_path) {
            return asset_response(&prerendered_path, document.data.into_owned());
        }

        if let Some(index) = Assets::get("index.html") {
            return asset_response("index.html", index.data.into_owned());
        }

        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "embedded frontend is missing index.html",
        )
            .into_response();
    }

    if let Some(not_found) = Assets::get("404.html") {
        return asset_response_with_status(
            "404.html",
            not_found.data.into_owned(),
            StatusCode::NOT_FOUND,
        );
    }

    (StatusCode::NOT_FOUND, "Not found").into_response()
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
