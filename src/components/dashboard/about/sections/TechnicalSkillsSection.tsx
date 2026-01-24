"use client";

import { useState } from "react";
import { FiCode, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, TechTag, TechnicalSkill } from "../types";

interface TechnicalSkillsSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
}

export default function TechnicalSkillsSection({ data, setData }: TechnicalSkillsSectionProps) {
  // State to track new tag input for each skill category
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  const addSkill = () => {
    setData({
      ...data,
      technicalSkills: [
        ...data.technicalSkills,
        { id: Date.now().toString(), title: "", description: "", tags: [] },
      ],
    });
  };

  const updateSkill = (id: string, field: keyof TechnicalSkill, value: string | TechTag[]) => {
    const newSkills = data.technicalSkills.map((skill) =>
      skill.id === id ? { ...skill, [field]: value } : skill,
    );
    setData({ ...data, technicalSkills: newSkills });
  };

  const deleteSkill = (id: string) => {
    setData({
      ...data,
      technicalSkills: data.technicalSkills.filter((skill) => skill.id !== id),
    });
  };

  const inferIconName = (name: string): string => {
    const lowerName = name.toLowerCase().replace(/\s+/g, "");

    // Common mappings
    const mappings: Record<string, string> = {
      go: "golang",
      "c++": "cplusplus",
      cpp: "cplusplus",
      "c#": "csharp",
      csharp: "csharp",
      "next.js": "nextjs",
      "node.js": "nodedotjs",
      nodejs: "nodedotjs",
      "vue.js": "vue",
      vuejs: "vue",
      "nuxt.js": "nuxt",
      nuxtjs: "nuxt",
      gcp: "googlecloud",
      aws: "aws",
    };

    if (mappings[lowerName]) return mappings[lowerName];

    // Default: try removing dots and special chars
    return lowerName.replace(/\./g, "").replace(/[^a-z0-9]/g, "");
  };

  const addTag = (skillId: string) => {
    const tagName = tagInputs[skillId]?.trim();
    if (!tagName) return;

    const skill = data.technicalSkills.find((s) => s.id === skillId);
    if (skill) {
      updateSkill(skillId, "tags", [
        ...skill.tags,
        { name: tagName, icon: inferIconName(tagName) },
      ]);
      setTagInputs({ ...tagInputs, [skillId]: "" });
    }
  };

  const deleteTag = (skillId: string, tagIndex: number) => {
    const skill = data.technicalSkills.find((s) => s.id === skillId);
    if (skill) {
      updateSkill(
        skillId,
        "tags",
        skill.tags.filter((_, i) => i !== tagIndex),
      );
    }
  };

  return (
    <section className={styles.section}>
      <h2>
        <FiCode />
        Technical Skills
      </h2>

      <div className={styles.skillsList}>
        {data.technicalSkills.map((skill) => (
          <div key={skill.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <h4>{skill.title || "New Skill Category"}</h4>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => deleteSkill(skill.id)}
                title="Delete skill category"
              >
                <FiTrash2 />
              </button>
            </div>
            <div className={styles.itemFields}>
              <div className={styles.formGroup}>
                <label htmlFor={`skill-title-${skill.id}`}>Title</label>
                <input
                  id={`skill-title-${skill.id}`}
                  type="text"
                  value={skill.title}
                  onChange={(e) => updateSkill(skill.id, "title", e.target.value)}
                  placeholder="e.g., Languages, Backend, Frontend"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor={`skill-desc-${skill.id}`}>Description</label>
                <textarea
                  id={`skill-desc-${skill.id}`}
                  value={skill.description}
                  onChange={(e) => updateSkill(skill.id, "description", e.target.value)}
                  placeholder="Describe your expertise in this area..."
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--neutral-on-background-weak)",
                  }}
                >
                  Tech Stack Tags
                </div>
                <div className={styles.tagsContainer}>
                  {skill.tags.map((tag, tagIndex) => (
                    <div key={`tag-${skill.id}-${tagIndex}`} className={styles.tagChip}>
                      {tag.name}
                      <button
                        type="button"
                        className={styles.deleteTagBtn}
                        onClick={() => deleteTag(skill.id, tagIndex)}
                        title="Delete tag"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.addTagRow}>
                  <input
                    type="text"
                    value={tagInputs[skill.id] || ""}
                    onChange={(e) => setTagInputs({ ...tagInputs, [skill.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(skill.id);
                      }
                    }}
                    placeholder="Add new tech skill..."
                  />
                  <button type="button" className={styles.addBtn} onClick={() => addTag(skill.id)}>
                    <FiPlus />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addSkill}>
          <FiPlus />
          Add Skill Category
        </button>
      </div>
    </section>
  );
}
