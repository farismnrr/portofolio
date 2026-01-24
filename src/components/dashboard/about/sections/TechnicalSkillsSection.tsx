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
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  const addSkill = () => {
    setData({
      ...data,
      technicalSkills: [
        ...data.technicalSkills,
        { id: Date.now().toString(), title: "", tags: [] },
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
    const mappings: Record<string, string> = {
      go: "golang",
      "c++": "cplusplus",
      cpp: "cplusplus",
      "c#": "csharp",
      csharp: "csharp",
      "next.js": "nextjs",
      "node.js": "nodedotjs",
      nodejs: "nodedotjs",
    };
    return mappings[lowerName] || lowerName.replace(/\./g, "").replace(/[^a-z0-9]/g, "");
  };

  const addTag = (skillId: string) => {
    const tagName = tagInputs[skillId]?.trim();
    if (!tagName) return;

    const skill = data.technicalSkills.find((s) => s.id === skillId);
    if (skill) {
      updateSkill(skillId, "tags", [
        ...skill.tags,
        { id: Date.now().toString(), name: tagName, icon: inferIconName(tagName) },
      ]);
      setTagInputs({ ...tagInputs, [skillId]: "" });
    }
  };

  const deleteTag = (skillId: string, tagId: string) => {
    const skill = data.technicalSkills.find((s) => s.id === skillId);
    if (skill) {
      updateSkill(
        skillId,
        "tags",
        skill.tags.filter((t) => t.id !== tagId),
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
              <h4>{skill.title || "New Category"}</h4>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => deleteSkill(skill.id)}
              >
                <FiTrash2 />
              </button>
            </div>
            <div className={styles.itemFields}>
              <div className={styles.formGroup}>
                <label htmlFor={`skill-title-${skill.id}`}>Category Title</label>
                <input
                  id={`skill-title-${skill.id}`}
                  type="text"
                  value={skill.title}
                  onChange={(e) => updateSkill(skill.id, "title", e.target.value)}
                  placeholder="e.g., Languages"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor={`skill-tags-${skill.id}`}>Tags</label>
                <div id={`skill-tags-${skill.id}`} className={styles.tagsContainer}>
                  {skill.tags.map((tag) => (
                    <div key={tag.id} className={styles.tagChip}>
                      {tag.name}
                      <button
                        type="button"
                        className={styles.deleteTagBtn}
                        onClick={() => tag.id && deleteTag(skill.id, tag.id)}
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
                    onKeyDown={(e) => e.key === "Enter" && addTag(skill.id)}
                    placeholder="Add tag..."
                  />
                  <button type="button" className={styles.addBtn} onClick={() => addTag(skill.id)}>
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addSkill}>
          <FiPlus /> Add Category
        </button>
      </div>
    </section>
  );
}
