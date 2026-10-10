use std::{
    env,
    sync::atomic::{AtomicU64, Ordering},
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use reqwest::{Client, RequestBuilder};
use serde::{Deserialize, Serialize};
use tokio::time::sleep;

static REQUEST_COUNTER: AtomicU64 = AtomicU64::new(1);
const MAX_CHAT_ATTEMPTS: u8 = 2;
const MAX_LOG_BODY_CHARS: usize = 512;

#[derive(Clone)]
pub struct AiState {
    client: Client,
    base_url: String,
    api_key: Option<String>,
    model: String,
    embedding_model: Option<String>,
}

impl AiState {
    pub fn from_env() -> Result<Self, String> {
        let base_url = required_env("NINE_ROUTER_URL")?;
        let model = required_env("NINE_ROUTER_MODEL")?;
        let connect_timeout_seconds = required_u64_env("NINE_ROUTER_CONNECT_TIMEOUT_SECONDS")?;
        let request_timeout_seconds = required_u64_env("NINE_ROUTER_TIMEOUT_SECONDS")?;

        Ok(Self {
            client: Client::builder()
                .connect_timeout(Duration::from_secs(connect_timeout_seconds))
                .timeout(Duration::from_secs(request_timeout_seconds))
                .build()
                .map_err(|error| format!("failed to build AI HTTP client: {error}"))?,
            base_url: base_url.trim_end_matches('/').to_string(),
            api_key: env::var("NINE_ROUTER_API_KEY")
                .ok()
                .filter(|value| !value.trim().is_empty()),
            model,
            embedding_model: env::var("AI_EMBEDDING_MODEL")
                .ok()
                .filter(|value| !value.trim().is_empty()),
        })
    }

    #[cfg(feature = "role-match")]
    pub async fn complete(&self, system: &str, data: &serde_json::Value) -> Result<String, String> {
        let message = serde_json::to_string(data).map_err(|_| "invalid_ai_input")?;
        let id = request_id();
        for attempt in 1..=MAX_CHAT_ATTEMPTS {
            let request = NineRouterRequest {
                model: &self.model,
                messages: vec![
                    NineRouterMessage {
                        role: "system",
                        content: system,
                    },
                    NineRouterMessage {
                        role: "user",
                        content: &message,
                    },
                ],
                reasoning_effort: "medium",
            };
            let result = self
                .auth(
                    self.client
                        .post(format!("{}/chat/completions", self.base_url))
                        .json(&request),
                )
                .send()
                .await;
            match result {
                Ok(response) if response.status().is_success() => {
                    let payload = response
                        .json::<NineRouterResponse>()
                        .await
                        .map_err(|_| "ai_invalid_response")?;
                    return payload
                        .choices
                        .into_iter()
                        .next()
                        .map(|choice| choice.message.content)
                        .filter(|content| !content.trim().is_empty())
                        .ok_or_else(|| "ai_empty_response".into());
                }
                Ok(response) => {
                    let status = response.status();
                    tracing::warn!(request_id = %id, attempt, status = status.as_u16(), "role-match provider request failed");
                    if retryable_status(status) && attempt < MAX_CHAT_ATTEMPTS {
                        sleep(retry_delay(&id)).await;
                        continue;
                    }
                    return Err("ai_upstream_error".into());
                }
                Err(error) => {
                    if (error.is_timeout() || error.is_connect()) && attempt < MAX_CHAT_ATTEMPTS {
                        sleep(retry_delay(&id)).await;
                        continue;
                    }
                    return Err(if error.is_timeout() {
                        "ai_upstream_timeout"
                    } else {
                        "ai_upstream_unavailable"
                    }
                    .into());
                }
            }
        }
        Err("ai_upstream_unavailable".into())
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
    metadata: Option<ChatMetadata>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChatMetadata {
    target: Option<String>,
    evidence_count: Option<usize>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    request_id: String,
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

fn required_env(name: &str) -> Result<String, String> {
    let value = env::var(name).map_err(|_| format!("{name} is required"))?;
    let value = value.trim();

    if value.is_empty() {
        return Err(format!("{name} cannot be empty"));
    }

    Ok(value.to_string())
}

fn required_u64_env(name: &str) -> Result<u64, String> {
    let value = required_env(name)?;
    let parsed = value
        .parse::<u64>()
        .map_err(|_| format!("{name} must be a positive integer"))?;

    if parsed == 0 {
        return Err(format!("{name} must be greater than zero"));
    }

    Ok(parsed)
}

fn normalized_reasoning_effort(value: Option<&str>) -> &'static str {
    match value {
        Some("medium") => "medium",
        Some("high") => "high",
        _ => "low",
    }
}

fn request_id() -> String {
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    let counter = REQUEST_COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("cvai-{millis:x}-{counter:x}")
}

fn retry_delay(request_id: &str) -> Duration {
    let jitter_seed = request_id.bytes().fold(0_u64, |value, byte| {
        value.wrapping_mul(31).wrapping_add(u64::from(byte))
    });
    Duration::from_millis(750 + (jitter_seed % 751))
}

fn retryable_status(status: StatusCode) -> bool {
    matches!(
        status,
        StatusCode::REQUEST_TIMEOUT
            | StatusCode::TOO_MANY_REQUESTS
            | StatusCode::BAD_GATEWAY
            | StatusCode::SERVICE_UNAVAILABLE
            | StatusCode::GATEWAY_TIMEOUT
    )
}

fn sanitized_body(body: &str) -> String {
    body.chars().take(MAX_LOG_BODY_CHARS).collect()
}

fn error_response(status: StatusCode, request_id: &str, error: &str) -> Response {
    (
        status,
        Json(ChatResponse {
            message: None,
            error: Some(error.to_string()),
            request_id: request_id.to_string(),
        }),
    )
        .into_response()
}

pub async fn chat(State(state): State<AiState>, Json(payload): Json<ChatRequest>) -> Response {
    let message = payload.message.trim();
    let request_id = request_id();

    if message.is_empty() {
        return error_response(StatusCode::BAD_REQUEST, &request_id, "ai_invalid_request");
    }

    let reasoning_effort = normalized_reasoning_effort(payload.reasoning_effort.as_deref());
    let prompt_bytes = message.len();
    let target = payload
        .metadata
        .as_ref()
        .and_then(|metadata| metadata.target.as_deref())
        .unwrap_or("unspecified");
    let evidence_count = payload
        .metadata
        .as_ref()
        .and_then(|metadata| metadata.evidence_count)
        .unwrap_or_default();

    for attempt in 1..=MAX_CHAT_ATTEMPTS {
        let started = Instant::now();
        let request = NineRouterRequest {
            model: &state.model,
            messages: vec![NineRouterMessage {
                role: "user",
                content: message,
            }],
            reasoning_effort,
        };

        tracing::info!(
            request_id = %request_id,
            model = %state.model,
            reasoning_effort,
            prompt_bytes,
            target,
            evidence_count,
            attempt,
            max_attempts = MAX_CHAT_ATTEMPTS,
            "sending AI chat request"
        );

        let response = state
            .auth(
                state
                    .client
                    .post(format!("{}/chat/completions", state.base_url))
                    .json(&request),
            )
            .send()
            .await;

        match response {
            Ok(response) if response.status().is_success() => {
                let upstream_status = response.status().as_u16();
                match response.json::<NineRouterResponse>().await {
                    Ok(payload) => match payload.choices.into_iter().next() {
                        Some(choice) if !choice.message.content.trim().is_empty() => {
                            tracing::info!(
                                request_id = %request_id,
                                model = %state.model,
                                attempt,
                                upstream_status,
                                elapsed_ms = started.elapsed().as_millis(),
                                "AI chat request succeeded"
                            );
                            return (
                                StatusCode::OK,
                                Json(ChatResponse {
                                    message: Some(choice.message.content),
                                    error: None,
                                    request_id,
                                }),
                            )
                                .into_response();
                        }
                        _ => {
                            tracing::error!(
                                request_id = %request_id,
                                model = %state.model,
                                attempt,
                                upstream_status,
                                elapsed_ms = started.elapsed().as_millis(),
                                error_category = "empty_response",
                                "9router returned an empty response"
                            );
                            return error_response(
                                StatusCode::BAD_GATEWAY,
                                &request_id,
                                "ai_upstream_empty_response",
                            );
                        }
                    },
                    Err(error) => {
                        tracing::error!(
                            request_id = %request_id,
                            model = %state.model,
                            attempt,
                            upstream_status,
                            elapsed_ms = started.elapsed().as_millis(),
                            error_category = "invalid_response",
                            %error,
                            "failed to decode 9router response"
                        );
                        return error_response(
                            StatusCode::BAD_GATEWAY,
                            &request_id,
                            "ai_upstream_invalid_response",
                        );
                    }
                }
            }
            Ok(response) => {
                let upstream_status = response.status();
                let body = response.text().await.unwrap_or_default();
                let retryable = retryable_status(upstream_status);

                tracing::warn!(
                    request_id = %request_id,
                    model = %state.model,
                    attempt,
                    upstream_status = upstream_status.as_u16(),
                    elapsed_ms = started.elapsed().as_millis(),
                    retryable,
                    error_category = "upstream_http_error",
                    upstream_body = %sanitized_body(&body),
                    "9router returned an error"
                );

                if retryable && attempt < MAX_CHAT_ATTEMPTS {
                    sleep(retry_delay(&request_id)).await;
                    continue;
                }

                let (status, error) = match upstream_status {
                    StatusCode::REQUEST_TIMEOUT | StatusCode::GATEWAY_TIMEOUT => {
                        (StatusCode::GATEWAY_TIMEOUT, "ai_upstream_timeout")
                    }
                    StatusCode::TOO_MANY_REQUESTS => {
                        (StatusCode::TOO_MANY_REQUESTS, "ai_upstream_rate_limited")
                    }
                    _ => (StatusCode::BAD_GATEWAY, "ai_upstream_error"),
                };
                return error_response(status, &request_id, error);
            }
            Err(error) => {
                let retryable = error.is_timeout() || error.is_connect();
                let error_category = if error.is_timeout() {
                    "timeout"
                } else if error.is_connect() {
                    "connect"
                } else {
                    "network"
                };

                tracing::warn!(
                    request_id = %request_id,
                    model = %state.model,
                    attempt,
                    elapsed_ms = started.elapsed().as_millis(),
                    retryable,
                    error_category,
                    %error,
                    "failed to reach 9router"
                );

                if retryable && attempt < MAX_CHAT_ATTEMPTS {
                    sleep(retry_delay(&request_id)).await;
                    continue;
                }

                let (status, error_code) = if error.is_timeout() {
                    (StatusCode::GATEWAY_TIMEOUT, "ai_upstream_timeout")
                } else {
                    (StatusCode::BAD_GATEWAY, "ai_upstream_unavailable")
                };
                return error_response(status, &request_id, error_code);
            }
        }
    }

    error_response(
        StatusCode::BAD_GATEWAY,
        &request_id,
        "ai_upstream_unavailable",
    )
}
