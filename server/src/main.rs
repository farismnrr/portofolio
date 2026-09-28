use std::{env, net::SocketAddr, path::PathBuf};

use axum::{routing::get_service, Router};
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "portfolio_server=info,tower_http=info".into()),
        )
        .init();

    let dist_dir = env::var("DIST_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("../frontend/dist"));

    let index = dist_dir.join("index.html");
    let static_files = ServeDir::new(&dist_dir).fallback(ServeFile::new(index));

    let app = Router::new()
        .fallback_service(get_service(static_files))
        .layer(TraceLayer::new_for_http());

    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3000);

    let address = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("failed to bind server");

    tracing::info!("serving portfolio on http://{address}");
    axum::serve(listener, app).await.expect("server error");
}
