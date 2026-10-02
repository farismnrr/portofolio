use std::{
    collections::{hash_map::DefaultHasher, HashMap},
    env,
    hash::{Hash, Hasher},
    sync::Arc,
};

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::{postgres::PgPoolOptions, PgPool, Row};

use crate::ai::AiState;

const VECTOR_DIM: usize = 256;

#[derive(Clone)]
pub struct RagState {
    pool: PgPool,
    ai: AiState,
    corpus: Arc<Vec<CorpusChunk>>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CorpusChunk {
    id: String,
    source_type: String,
    source_id: String,
    section: String,
    company: String,
    skills: Vec<String>,
    role_tags: Vec<String>,
    content: String,
}

#[derive(Deserialize)]
pub struct RetrieveRequest {
    target: String,
    query: Option<String>,
    limit: Option<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Evidence {
    id: String,
    source_type: String,
    source_id: String,
    section: String,
    company: String,
    skills: Vec<String>,
    role_tags: Vec<String>,
    content: String,
    score: f64,
}

#[derive(Serialize)]
pub struct RetrieveResponse {
    evidence: Vec<Evidence>,
    backend: &'static str,
}

impl RagState {
    pub fn from_env(ai: AiState, corpus_json: &[u8]) -> Result<Self, String> {
        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://portfolio@127.0.0.1:5433/portfolio".to_string());
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect_lazy(&database_url)
            .map_err(|error| format!("invalid DATABASE_URL: {error}"))?;
        let corpus = serde_json::from_slice::<Vec<CorpusChunk>>(corpus_json)
            .map_err(|error| format!("invalid embedded CV corpus: {error}"))?;

        Ok(Self {
            pool,
            ai,
            corpus: Arc::new(corpus),
        })
    }

    async fn ensure_schema(&self) -> Result<(), sqlx::Error> {
        sqlx::query("CREATE EXTENSION IF NOT EXISTS vector")
            .execute(&self.pool)
            .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS cv_chunks (
                id TEXT PRIMARY KEY,
                source_type TEXT NOT NULL,
                source_id TEXT NOT NULL,
                section TEXT NOT NULL,
                company TEXT NOT NULL DEFAULT '',
                skills TEXT[] NOT NULL DEFAULT '{}',
                role_tags TEXT[] NOT NULL DEFAULT '{}',
                content TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                embedding vector(256) NOT NULL,
                search tsvector GENERATED ALWAYS AS (
                    to_tsvector('english', coalesce(content, ''))
                ) STORED
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS cv_chunks_search_idx ON cv_chunks USING GIN(search)",
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS cv_chunks_embedding_idx ON cv_chunks USING hnsw (embedding vector_cosine_ops)",
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn sync_index(&self) -> Result<(), sqlx::Error> {
        self.ensure_schema().await?;

        let rows = sqlx::query("SELECT id, content_hash FROM cv_chunks")
            .fetch_all(&self.pool)
            .await?;
        let existing = rows
            .into_iter()
            .map(|row| {
                (
                    row.get::<String, _>("id"),
                    row.get::<String, _>("content_hash"),
                )
            })
            .collect::<HashMap<_, _>>();

        let changed = self
            .corpus
            .iter()
            .filter_map(|chunk| {
                let hash = content_hash(&chunk.content);
                match existing.get(&chunk.id) {
                    Some(current) if current == &hash => None,
                    _ => Some((chunk, hash)),
                }
            })
            .collect::<Vec<_>>();

        if changed.is_empty() {
            return Ok(());
        }

        let inputs = changed
            .iter()
            .map(|(chunk, _)| chunk.content.clone())
            .collect::<Vec<_>>();
        let vectors = match self.ai.embeddings(&inputs).await {
            Some(values) if values.len() == inputs.len() => values
                .iter()
                .map(|value| fold_embedding(value))
                .collect::<Vec<_>>(),
            _ => {
                tracing::warn!(
                    "9router embedding provider unavailable; using deterministic local fallback"
                );
                inputs
                    .iter()
                    .map(|value| fallback_embedding(value))
                    .collect::<Vec<_>>()
            }
        };

        for ((chunk, hash), vector) in changed.into_iter().zip(vectors.into_iter()) {
            let vector = vector_literal(&vector);
            sqlx::query(
                r#"
                INSERT INTO cv_chunks (
                    id, source_type, source_id, section, company,
                    skills, role_tags, content, content_hash, embedding
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::vector)
                ON CONFLICT (id) DO UPDATE SET
                    source_type = EXCLUDED.source_type,
                    source_id = EXCLUDED.source_id,
                    section = EXCLUDED.section,
                    company = EXCLUDED.company,
                    skills = EXCLUDED.skills,
                    role_tags = EXCLUDED.role_tags,
                    content = EXCLUDED.content,
                    content_hash = EXCLUDED.content_hash,
                    embedding = EXCLUDED.embedding
                "#,
            )
            .bind(&chunk.id)
            .bind(&chunk.source_type)
            .bind(&chunk.source_id)
            .bind(&chunk.section)
            .bind(&chunk.company)
            .bind(&chunk.skills)
            .bind(&chunk.role_tags)
            .bind(&chunk.content)
            .bind(hash)
            .bind(vector)
            .execute(&self.pool)
            .await?;
        }

        Ok(())
    }

    async fn search_pgvector(&self, query: &str, limit: i64) -> Result<Vec<Evidence>, sqlx::Error> {
        self.sync_index().await?;

        let query_vector = match self.ai.embeddings(&[query.to_string()]).await {
            Some(mut values) if values.len() == 1 => fold_embedding(&values.remove(0)),
            _ => fallback_embedding(query),
        };
        let vector = vector_literal(&query_vector);

        let rows = sqlx::query(
            r#"
            SELECT
                id, source_type, source_id, section, company,
                skills, role_tags, content,
                (
                    (1 - (embedding <=> $1::vector)) * 0.68
                    + ts_rank(search, websearch_to_tsquery('english', $2)) * 0.32
                )::float8 AS score
            FROM cv_chunks
            ORDER BY score DESC
            LIMIT $3
            "#,
        )
        .bind(vector)
        .bind(query)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|row| Evidence {
                id: row.get("id"),
                source_type: row.get("source_type"),
                source_id: row.get("source_id"),
                section: row.get("section"),
                company: row.get("company"),
                skills: row.get("skills"),
                role_tags: row.get("role_tags"),
                content: row.get("content"),
                score: row.get("score"),
            })
            .collect())
    }

    fn search_memory(&self, query: &str, limit: usize) -> Vec<Evidence> {
        let query_vector = fallback_embedding(query);
        let mut scored = self
            .corpus
            .iter()
            .map(|chunk| {
                let vector = fallback_embedding(&chunk.content);
                let lexical = lexical_score(query, &chunk.content);
                let vector_score = cosine(&query_vector, &vector);
                Evidence {
                    id: chunk.id.clone(),
                    source_type: chunk.source_type.clone(),
                    source_id: chunk.source_id.clone(),
                    section: chunk.section.clone(),
                    company: chunk.company.clone(),
                    skills: chunk.skills.clone(),
                    role_tags: chunk.role_tags.clone(),
                    content: chunk.content.clone(),
                    score: vector_score * 0.68 + lexical * 0.32,
                }
            })
            .collect::<Vec<_>>();
        scored.sort_by(|a, b| b.score.total_cmp(&a.score));
        scored.truncate(limit);
        scored
    }
}

pub async fn retrieve(
    State(state): State<RagState>,
    Json(payload): Json<RetrieveRequest>,
) -> impl IntoResponse {
    let limit = payload.limit.unwrap_or(16).clamp(6, 32);
    let target = payload.target.trim().to_lowercase();
    let default_query = match target.as_str() {
        "ai-engineer" => "AI engineer RAG retrieval embeddings LangGraph agents MCP LLM inference machine learning Python pgvector",
        "devops" => "DevOps platform infrastructure Docker Linux CI CD observability OpenTelemetry deployment cloud backend reliability",
        "software-engineer" => "software engineer backend frontend APIs distributed systems PostgreSQL Rust Go TypeScript product engineering",
        _ => "software engineer backend AI systems RAG agents infrastructure IoT product engineering Rust Go TypeScript PostgreSQL Docker",
    };
    let query = payload
        .query
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(default_query);

    match state.search_pgvector(query, limit).await {
        Ok(evidence) => (
            StatusCode::OK,
            Json(RetrieveResponse {
                evidence,
                backend: "pgvector+postgres-fts",
            }),
        ),
        Err(error) => {
            tracing::error!(%error, "pgvector retrieval unavailable; falling back to in-memory retrieval");
            (
                StatusCode::OK,
                Json(RetrieveResponse {
                    evidence: state.search_memory(query, limit as usize),
                    backend: "memory-fallback",
                }),
            )
        }
    }
}

fn content_hash(content: &str) -> String {
    format!("{:x}", Sha256::digest(content.as_bytes()))
}

fn fold_embedding(input: &[f32]) -> Vec<f32> {
    if input.is_empty() {
        return vec![0.0; VECTOR_DIM];
    }

    let mut output = vec![0.0_f32; VECTOR_DIM];
    for (index, value) in input.iter().enumerate() {
        output[index % VECTOR_DIM] += *value;
    }
    normalize(output)
}

fn fallback_embedding(content: &str) -> Vec<f32> {
    let mut output = vec![0.0_f32; VECTOR_DIM];
    let tokens = content
        .split(|character: char| !character.is_alphanumeric())
        .filter(|token| token.len() > 1)
        .map(str::to_lowercase)
        .collect::<Vec<_>>();

    for token in &tokens {
        add_hashed_feature(&mut output, token, 1.0);
    }
    for pair in tokens.windows(2) {
        add_hashed_feature(&mut output, &format!("{} {}", pair[0], pair[1]), 0.6);
    }

    normalize(output)
}

fn add_hashed_feature(output: &mut [f32], value: &str, weight: f32) {
    let mut hasher = DefaultHasher::new();
    value.hash(&mut hasher);
    let hash = hasher.finish();
    let bucket = (hash as usize) % output.len();
    let sign = if hash & 1 == 0 { 1.0 } else { -1.0 };
    output[bucket] += weight * sign;
}

fn normalize(mut values: Vec<f32>) -> Vec<f32> {
    let norm = values
        .iter()
        .map(|value| value * value)
        .sum::<f32>()
        .sqrt();
    if norm > 0.0 {
        for value in &mut values {
            *value /= norm;
        }
    }
    values
}

fn vector_literal(values: &[f32]) -> String {
    format!(
        "[{}]",
        values
            .iter()
            .map(|value| format!("{value:.7}"))
            .collect::<Vec<_>>()
            .join(",")
    )
}

fn lexical_score(query: &str, content: &str) -> f64 {
    let content = content.to_lowercase();
    let tokens = query
        .split(|character: char| !character.is_alphanumeric())
        .filter(|token| token.len() > 2)
        .map(str::to_lowercase)
        .collect::<Vec<_>>();

    if tokens.is_empty() {
        return 0.0;
    }

    let matches = tokens
        .iter()
        .filter(|token| content.contains(token.as_str()))
        .count();
    matches as f64 / tokens.len() as f64
}

fn cosine(a: &[f32], b: &[f32]) -> f64 {
    a.iter()
        .zip(b)
        .map(|(left, right)| f64::from(*left) * f64::from(*right))
        .sum()
}
