use std::env;

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Clone)]
pub struct AiState {
    client: Client,
    base_url: String,
    api_key: Option<String>,
    model: String,
}

impl AiState {
    pub fn from_env() -> Self {
        Self {
            client: Client::new(),
            base_url: env::var("NINE_ROUTER_BASE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:20128/v1".to_string())
                .trim_end_matches('/')
                .to_string(),
            api_key: env::var("NINE_ROUTER_API_KEY")
                .ok()
                .filter(|value| !value.trim().is_empty()),
            model: env::var("AI_MODEL").unwrap_or_else(|_| "gpt-6-luna".to_string()),
        }
    }
}

#[derive(Deserialize)]
pub struct ChatRequest {
    message: String,
}

#[derive(Serialize)]
pub struct ChatResponse {
    message: String,
}

#[derive(Serialize)]
struct NineRouterRequest<'a> {
    model: &'a str,
    messages: [NineRouterMessage<'a>; 1],
    reasoning_effort: &'a str,
}

#[derive(Serialize)]
struct NineRouterMessage<'a> {
    role: &'a str,
    content: &'a str,
}

#[derive(Deserialize)]
struct NineRouterResponse {
    choices: Vec<NineRouterChoice>,
}

#[derive(Deserialize)]
struct NineRouterChoice {
    message: NineRouterResponseMessage,
}

#[derive(Deserialize)]
struct NineRouterResponseMessage {
    content: String,
}

pub async fn chat(
    State(state): State<AiState>,
    Json(payload): Json<ChatRequest>,
) -> impl IntoResponse {
    let message = payload.message.trim();

    if message.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ChatResponse {
                message: "message cannot be empty".to_string(),
            }),
        );
    }

    let request = NineRouterRequest {
        model: &state.model,
        messages: [NineRouterMessage {
            role: "user",
            content: message,
        }],
        reasoning_effort: "low",
    };

    let mut request_builder = state
        .client
        .post(format!("{}/chat/completions", state.base_url))
        .json(&request);

    if let Some(api_key) = &state.api_key {
        request_builder = request_builder.bearer_auth(api_key);
    }

    let response = match request_builder.send().await {
        Ok(response) => response,
        Err(error) => {
            tracing::error!(%error, "failed to reach 9router");
            return (
                StatusCode::BAD_GATEWAY,
                Json(ChatResponse {
                    message: "AI service unavailable".to_string(),
                }),
            );
        }
    };

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        tracing::error!(%status, %body, "9router returned an error");

        return (
            StatusCode::BAD_GATEWAY,
            Json(ChatResponse {
                message: "AI service returned an error".to_string(),
            }),
        );
    }

    match response.json::<NineRouterResponse>().await {
        Ok(payload) => match payload.choices.into_iter().next() {
            Some(choice) if !choice.message.content.trim().is_empty() => (
                StatusCode::OK,
                Json(ChatResponse {
                    message: choice.message.content,
                }),
            ),
            _ => (
                StatusCode::BAD_GATEWAY,
                Json(ChatResponse {
                    message: "AI service returned an empty response".to_string(),
                }),
            ),
        },
        Err(error) => {
            tracing::error!(%error, "failed to decode 9router response");
            (
                StatusCode::BAD_GATEWAY,
                Json(ChatResponse {
                    message: "AI service returned an invalid response".to_string(),
                }),
            )
        }
    }
}
