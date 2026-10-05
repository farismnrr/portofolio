use std::{collections::HashMap, sync::OnceLock};

use serde::Deserialize;

pub const CONTRACT_VERSION: &str = "cv-contract/v1";
const PROFILE_REGISTRY_JSON: &str = include_str!("../../frontend/content/cv-profiles.json");

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CvProfile {
    pub id: String,
    pub headline: String,
    pub max_pages: u8,
    pub filename: String,
    pub retrieval_query: String,
    pub preferred_signals: Vec<String>,
    pub secondary_signals: Vec<String>,
    pub source_type_weights: HashMap<String, f64>,
    pub project_chunk_cap: usize,
    pub enrichment_caps: HashMap<String, usize>,
    pub technical_scopes: Vec<TechnicalScope>,
    pub layout_policy: LayoutPolicy,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TechnicalScope {
    pub label: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LayoutPolicy {
    pub min_second_page_fill: f64,
    pub min_body_size_pt: f32,
    pub minimum_items: MinimumItems,
}

#[derive(Debug, Clone, Deserialize)]
pub struct MinimumItems {
    pub projects: usize,
    pub experiences: usize,
    pub certifications: usize,
}

static REGISTRY: OnceLock<Result<HashMap<String, CvProfile>, String>> = OnceLock::new();

fn registry() -> &'static Result<HashMap<String, CvProfile>, String> {
    REGISTRY.get_or_init(|| {
        serde_json::from_str(PROFILE_REGISTRY_JSON)
            .map_err(|error| format!("invalid embedded CV profile registry: {error}"))
    })
}

pub fn get(id: &str) -> Result<&'static CvProfile, String> {
    match registry() {
        Ok(profiles) => profiles
            .get(id)
            .ok_or_else(|| format!("unknown CV profile: {id}")),
        Err(error) => Err(error.clone()),
    }
}

#[cfg(test)]
mod tests {
    use super::get;

    #[test]
    fn registry_contains_all_supported_profiles() {
        for id in ["general", "ai-engineer", "software-engineer", "devops"] {
            let profile = get(id).expect("profile should exist");
            assert_eq!(profile.id, id);
            assert!(!profile.preferred_signals.is_empty());
            assert!(!profile.retrieval_query.is_empty());
        }
    }

    #[test]
    fn registry_keeps_profile_specific_layout_and_filename() {
        let general = get("general").expect("general profile");
        let ai = get("ai-engineer").expect("AI profile");

        assert_eq!(general.max_pages, 2);
        assert_eq!(ai.max_pages, 1);
        assert!(general.layout_policy.min_second_page_fill > 0.0);
        assert_eq!(ai.layout_policy.min_second_page_fill, 0.0);
        assert_eq!(ai.filename, "Faris_Munir_Mahdi_AI_Engineer_CV.pdf");
        assert!(general.layout_policy.min_body_size_pt >= 10.0);
        assert!(ai.layout_policy.min_body_size_pt >= 10.0);
    }
}
