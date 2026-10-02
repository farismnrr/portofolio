use std::env;

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use reqwest::{Client, RequestBuilder};
use serde::{Deserialize, Serialize};

#[derive(Clone)]
pub struct AiState {
    client: Client,
    base_url: String,
    api_key: Option<String>,
    model: String,
    embedding_model: Option<String>,
}

impl AiState {
    pub fn from_env() -> Self {
        Self {
            client: Client::builder()
                .connect_timeout(std::time::Duration::from_secs(5))
                .timeout(std::time::Duration::from_secs(60))
                .build()
                .expect("valid AI HTTP client"),
            base_url: env::var("NINE_ROUTER_BASE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:20128/v1".to_string())
                .trim_end_matches('/')
                .to_string(),
            api_key: env::var("NINE_ROUTER_API_KEY")
                .ok()
                .filter(|value| !value.trim().is_empty()),
            model: env::var("AI_MODEL").unwrap_or_else(|_| "gpt-6-luna".to_string()),
            embedding_model: env::var("AI_EMBEDDING_MODEL")
                .ok()
                .filter(|value| !value.trim().is_empty()),
        }
    }

    fn auth(&self, builder: RequestBuilder) -> RequestBuilder {
        match &self.api_key {
            Some(api_key) => builder.bearer_auth(api_key),
            None => builder,
        }
    }

    async fn discover_embedding_model(&self) -> Option<String> {
        if let Some(model) = &self.embedding_model {
            return Some(model.clone());
        }

        let response = self
            .auth(
                self.client
                    .get(format!("{}/models/embedding", self.base_url)),
            )
            .send()
            .await
            .ok()?;

        if !response.status().is_success() {
            return None;
        }

        let payload = response.json::<ModelList>().await.ok()?;
        payload.data.into_iter().next().map(|model| model.id)
    }

    pub async fn embeddings(&self, input: &[String]) -> Option<Vec<Vec<f32>>> {
        if input.is_empty() {
            return Some(Vec::new());
        }

        let model = self.discover_embedding_model().await?;
        let request = EmbeddingRequest {
            model: &model,
            input,
        };
        let response = self
            .auth(
                self.client
                    .post(format!("{}/embeddings", self.base_url))
                    .json(&request),
            )
            .send()
            .await
            .ok()?;

        if !response.status().is_success() {
            return None;
        }

        let mut payload = response.json::<EmbeddingResponse>().await.ok()?;
        payload.data.sort_by_key(|item| item.index);
        let embeddings = payload
            .data
            .into_iter()
            .map(|item| item.embedding)
            .collect::<Vec<_>>();

        (embeddings.len() == input.len()).then_some(embeddings)
    }
}

#[derive(Deserialize)]
pub struct ChatRequest {
    message: String,
    reasoning_effort: Option<String>,
}

#[derive(Serialize)]
pub struct ChatResponse {
    message: String,
}

#[derive(Serialize)]
struct NineRouterRequest<'a> {
    model: &'a str,
    messages: Vec<NineRouterMessage<'a>>,
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

#[derive(Deserialize)]
struct ModelList {
    data: Vec<ModelItem>,
}

#[derive(Deserialize)]
struct ModelItem {
    id: String,
}

#[derive(Serialize)]
struct EmbeddingRequest<'a> {
    model: &'a str,
    input: &'a [String],
}

#[derive(Deserialize)]
struct EmbeddingResponse {
    data: Vec<EmbeddingItem>,
}

#[derive(Deserialize)]
struct EmbeddingItem {
    index: usize,
    embedding: Vec<f32>,
}

fn normalized_reasoning_effort(value: Option<&str>) -> &'static str {
    match value {
        Some("medium") => "medium",
        Some("high") => "high",
        _ => "low",
    }
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
        messages: vec![NineRouterMessage {
            role: "user",
            content: message,
        }],
        reasoning_effort: normalized_reasoning_effort(payload.reasoning_effort.as_deref()),
    };

    let response = match state
        .auth(
            state
                .client
                .post(format!("{}/chat/completions", state.base_url))
                .json(&request),
        )
        .send()
        .await
    {
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
