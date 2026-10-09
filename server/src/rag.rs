use std::{
    collections::{hash_map::DefaultHasher, HashMap, HashSet},
    env,
    hash::{Hash, Hasher},
    sync::Arc,
};

use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::{postgres::PgPoolOptions, PgPool, Row};

use crate::{
    ai::AiState,
    profiles::{self, CvProfile},
};

const VECTOR_DIM: usize = 256;
const MAX_SEMANTIC_EVIDENCE: usize = 10;
const MAX_TOTAL_EVIDENCE: usize = 25;

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

#[derive(Clone, Debug, Serialize)]
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
        let database_url =
            env::var("DATABASE_URL").map_err(|_| "DATABASE_URL is required".to_string())?;
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
                let hash = chunk_fingerprint(chunk);
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

        for ((chunk, hash), vector) in changed.into_iter().zip(vectors) {
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

    async fn search_pgvector(
        &self,
        query: &str,
        candidate_limit: i64,
    ) -> Result<Vec<Evidence>, sqlx::Error> {
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
        .bind(candidate_limit)
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

    fn rerank_evidence(
        &self,
        profile: &CvProfile,
        query: &str,
        evidence: Vec<Evidence>,
        limit: usize,
    ) -> Vec<Evidence> {
        rerank_evidence(profile, query, evidence, limit)
    }

    fn enrich_grounding_context(
        &self,
        profile: &CvProfile,
        query: &str,
        evidence: Vec<Evidence>,
        limit: usize,
    ) -> Vec<Evidence> {
        let mut evidence = self.rerank_evidence(profile, query, evidence, limit);
        let mut seen = evidence
            .iter()
            .map(|item| item.id.clone())
            .collect::<HashSet<_>>();
        let mut project_counts = evidence
            .iter()
            .filter(|item| item.source_type == "project")
            .fold(HashMap::<String, usize>::new(), |mut counts, item| {
                *counts.entry(item.source_id.clone()).or_default() += 1;
                counts
            });

        for source_type in [
            "profile",
            "experience",
            "skill",
            "education",
            "certification",
        ] {
            let cap = profile
                .enrichment_caps
                .get(source_type)
                .copied()
                .unwrap_or_default();
            if cap == 0 {
                continue;
            }

            let query_vector = fallback_embedding(query);
            let mut candidates = self
                .corpus
                .iter()
                .filter(|chunk| chunk.source_type == source_type && chunk.section == "summary")
                .map(|chunk| {
                    let vector = fallback_embedding(&chunk.content);
                    let raw_score = cosine(&query_vector, &vector) * 0.68
                        + lexical_score(query, &chunk.content) * 0.32;
                    let mut candidate = evidence_from_chunk(chunk, raw_score);
                    candidate.score = rerank_score(profile, query, &candidate);
                    (candidate, chunk)
                })
                .collect::<Vec<_>>();

            candidates.sort_by(|left, right| right.0.score.total_cmp(&left.0.score));

            for (candidate, chunk) in candidates.into_iter().take(cap) {
                if chunk.source_type == "project" {
                    let count = project_counts.entry(chunk.source_id.clone()).or_default();
                    if *count >= profile.project_chunk_cap {
                        continue;
                    }
                    *count += 1;
                }

                if seen.insert(candidate.id.clone()) {
                    evidence.push(candidate);
                }

                if evidence.len() >= MAX_TOTAL_EVIDENCE {
                    return evidence;
                }
            }
        }

        evidence.truncate(MAX_TOTAL_EVIDENCE);
        evidence
    }

    fn search_memory(
        &self,
        profile: &CvProfile,
        query: &str,
        candidate_limit: usize,
    ) -> Vec<Evidence> {
        let query_vector = fallback_embedding(query);
        let scored = self
            .corpus
            .iter()
            .map(|chunk| {
                let vector = fallback_embedding(&chunk.content);
                let lexical = lexical_score(query, &chunk.content);
                let vector_score = cosine(&query_vector, &vector);
                evidence_from_chunk(chunk, vector_score * 0.68 + lexical * 0.32)
            })
            .collect::<Vec<_>>();

        self.rerank_evidence(profile, query, scored, candidate_limit)
    }
}

pub async fn retrieve(
    State(state): State<RagState>,
    Json(payload): Json<RetrieveRequest>,
) -> Response {
    let target = payload.target.trim().to_lowercase();
    let profile = match profiles::get(&target) {
        Ok(profile) => profile,
        Err(error) => return (StatusCode::BAD_REQUEST, error).into_response(),
    };
    let limit = payload
        .limit
        .unwrap_or(MAX_SEMANTIC_EVIDENCE as i64)
        .clamp(6, MAX_SEMANTIC_EVIDENCE as i64) as usize;
    let query = payload
        .query
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(profile.retrieval_query.as_str());
    let candidate_limit = (limit.saturating_mul(4)).clamp(12, 40) as i64;

    match state.search_pgvector(query, candidate_limit).await {
        Ok(evidence) => (
            StatusCode::OK,
            Json(RetrieveResponse {
                evidence: state.enrich_grounding_context(profile, query, evidence, limit),
                backend: "pgvector+postgres-fts",
            }),
        )
            .into_response(),
        Err(error) => {
            tracing::error!(%error, profile = %profile.id, "pgvector retrieval unavailable; falling back to in-memory retrieval");
            (
                StatusCode::OK,
                Json(RetrieveResponse {
                    evidence: state.enrich_grounding_context(
                        profile,
                        query,
                        state.search_memory(profile, query, candidate_limit as usize),
                        limit,
                    ),
                    backend: "memory-fallback",
                }),
            )
                .into_response()
        }
    }
}

fn rerank_evidence(
    profile: &CvProfile,
    query: &str,
    mut evidence: Vec<Evidence>,
    limit: usize,
) -> Vec<Evidence> {
    for item in &mut evidence {
        item.score = rerank_score(profile, query, item);
    }

    let mut selected = Vec::with_capacity(limit);
    let mut project_counts = HashMap::<String, usize>::new();
    let mut source_counts = HashMap::<String, usize>::new();

    while selected.len() < limit && !evidence.is_empty() {
        let best_index = evidence
            .iter()
            .enumerate()
            .filter_map(|(index, item)| {
                if item.source_type == "project"
                    && project_counts
                        .get(&item.source_id)
                        .copied()
                        .unwrap_or_default()
                        >= profile.project_chunk_cap
                {
                    return None;
                }

                let diversity_penalty = source_counts
                    .get(&item.source_type)
                    .copied()
                    .unwrap_or_default() as f64
                    * 0.025
                    + if item.source_type == "project" {
                        project_counts
                            .get(&item.source_id)
                            .copied()
                            .unwrap_or_default() as f64
                            * 0.06
                    } else {
                        0.0
                    };
                Some((index, item.score - diversity_penalty))
            })
            .max_by(|left, right| left.1.total_cmp(&right.1))
            .map(|(index, _)| index);

        let Some(index) = best_index else {
            break;
        };
        let item = evidence.remove(index);
        if item.source_type == "project" {
            *project_counts.entry(item.source_id.clone()).or_default() += 1;
        }
        *source_counts.entry(item.source_type.clone()).or_default() += 1;
        selected.push(item);
    }

    selected
}

fn rerank_score(profile: &CvProfile, query: &str, item: &Evidence) -> f64 {
    let semantic_score = item.score.clamp(0.0, 1.0);
    let lexical = lexical_score(query, &item.content);
    let metadata = metadata_signal_score(profile, item);
    let source_preference = profile
        .source_type_weights
        .get(&item.source_type)
        .copied()
        .unwrap_or(0.35)
        .clamp(0.0, 1.0);

    (semantic_score * 0.55 + lexical * 0.10 + metadata * 0.25 + source_preference * 0.10)
        .clamp(0.0, 1.0)
}

fn metadata_signal_score(profile: &CvProfile, item: &Evidence) -> f64 {
    let skill_score = signal_match_score(&profile.preferred_signals, &item.skills, "") * 0.42
        + signal_match_score(&profile.secondary_signals, &item.skills, "") * 0.12;
    let role_score = signal_match_score(&profile.preferred_signals, &item.role_tags, "") * 0.28
        + signal_match_score(&profile.secondary_signals, &item.role_tags, "") * 0.08;
    let content_score = signal_match_score(&profile.preferred_signals, &[], &item.content) * 0.07
        + signal_match_score(&profile.secondary_signals, &[], &item.content) * 0.03;

    (skill_score + role_score + content_score).clamp(0.0, 1.0)
}

fn signal_match_score(signals: &[String], metadata: &[String], content: &str) -> f64 {
    if signals.is_empty() {
        return 0.0;
    }

    let metadata = metadata.join(" ").to_lowercase();
    let content = content.to_lowercase();
    let matched = signals
        .iter()
        .filter(|signal| {
            let signal = signal.to_lowercase();
            metadata.contains(&signal) || (!content.is_empty() && content.contains(&signal))
        })
        .count()
        .min(3);

    matched as f64 / signals.len().min(3) as f64
}

fn evidence_from_chunk(chunk: &CorpusChunk, score: f64) -> Evidence {
    Evidence {
        id: chunk.id.clone(),
        source_type: chunk.source_type.clone(),
        source_id: chunk.source_id.clone(),
        section: chunk.section.clone(),
        company: chunk.company.clone(),
        skills: chunk.skills.clone(),
        role_tags: chunk.role_tags.clone(),
        content: chunk.content.clone(),
        score,
    }
}

fn chunk_fingerprint(chunk: &CorpusChunk) -> String {
    content_hash(&format!(
        "{}|{}|{}|{}|{}|{:?}|{:?}|{}",
        chunk.source_type,
        chunk.source_id,
        chunk.section,
        chunk.company,
        chunk.content,
        chunk.skills,
        chunk.role_tags,
        chunk.id
    ))
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
    let norm = values.iter().map(|value| value * value).sum::<f32>().sqrt();
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

#[cfg(test)]
mod tests {
    use super::{rerank_evidence, Evidence};
    use crate::profiles;

    fn evidence(
        id: &str,
        source_type: &str,
        source_id: &str,
        skills: &[&str],
        role_tags: &[&str],
        score: f64,
    ) -> Evidence {
        Evidence {
            id: id.to_string(),
            source_type: source_type.to_string(),
            source_id: source_id.to_string(),
            section: "summary".to_string(),
            company: String::new(),
            skills: skills.iter().map(|value| (*value).to_string()).collect(),
            role_tags: role_tags.iter().map(|value| (*value).to_string()).collect(),
            content: format!("{id} evidence"),
            score,
        }
    }

    #[test]
    fn reranking_uses_profile_metadata_signals() {
        let profile = profiles::get("general").expect("general profile");
        let ranked = rerank_evidence(
            profile,
            "backend engineering",
            vec![
                evidence(
                    "generic",
                    "project",
                    "generic",
                    &["Graphic Design"],
                    &["Marketing"],
                    0.80,
                ),
                evidence(
                    "systems",
                    "project",
                    "systems",
                    &["Backend", "Database"],
                    &["Software Engineering"],
                    0.80,
                ),
            ],
            2,
        );

        assert_eq!(ranked[0].source_id, "systems");
    }

    #[test]
    fn reranking_applies_a_per_project_evidence_cap() {
        let profile = profiles::get("general").expect("general profile");
        let ranked = rerank_evidence(
            profile,
            "backend APIs",
            vec![
                evidence("one", "project", "same", &["Rust"], &["Backend"], 0.9),
                evidence("two", "project", "same", &["Rust"], &["Backend"], 0.89),
                evidence("three", "project", "same", &["Rust"], &["Backend"], 0.88),
                evidence("four", "project", "same", &["Rust"], &["Backend"], 0.87),
            ],
            4,
        );

        assert_eq!(ranked.len(), profile.project_chunk_cap);
    }
}
