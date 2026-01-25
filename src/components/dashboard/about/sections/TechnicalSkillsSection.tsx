"use client";

import { inferIconName } from "@/lib/utils/icons";
import { Icon } from "@once-ui-system/core";
import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiCode, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, TechTag, TechnicalSkill } from "../types";

interface TechnicalSkillsSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  errors?: Record<string, string>;
}

export default function TechnicalSkillsSection({
  data,
  setData,
  errors,
}: TechnicalSkillsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});

  // State to track new tag input for each skill category
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  const toggleItem = (id: string) => {
    setCollapsedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addSkill = () => {
    setData({
      ...data,
      technicalSkills: [
        ...data.technicalSkills,
        {
          id: Date.now().toString(),
          title: "",
          description: "",
          tags: [],
          order_by: data.technicalSkills.length,
        },
      ],
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSkills = [...data.technicalSkills];
    [newSkills[index - 1], newSkills[index]] = [newSkills[index], newSkills[index - 1]];
    setData({ ...data, technicalSkills: newSkills });
  };

  const moveDown = (index: number) => {
    if (index === data.technicalSkills.length - 1) return;
    const newSkills = [...data.technicalSkills];
    [newSkills[index + 1], newSkills[index]] = [newSkills[index], newSkills[index + 1]];
    setData({ ...data, technicalSkills: newSkills });
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
    <section className={`${styles.section} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sectionHeader}>
        <h2>
          <FiCode />
          Technical Skills
        </h2>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <FiChevronDown />
        </button>
      </div>

      <div className={styles.collapsibleContent}>
        <div className={styles.skillsList} style={{ marginTop: "1.5rem" }}>
          {data.technicalSkills.map((skill) => {
            const isItemCollapsed = collapsedItems[skill.id];
            return (
              <div
                key={skill.id}
                className={`${styles.item} ${isItemCollapsed ? styles.collapsed : ""}`}
              >
                <div className={styles.itemHeader}>
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      flex: 1,
                      color: "inherit",
                      font: "inherit",
                    }}
                    onClick={() => toggleItem(skill.id)}
                    aria-label={
                      isItemCollapsed ? "Expand skill category" : "Collapse skill category"
                    }
                  >
                    <FiChevronDown
                      style={{
                        transition: "transform 0.3s ease",
                        transform: isItemCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                        color: "var(--neutral-on-background-weak)",
                        fontSize: "1.25rem",
                      }}
                    />
                    <h4 style={{ margin: 0 }}>{skill.title || "New Skill Category"}</h4>
                  </button>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div className={styles.reorderBtns}>
                      <button
                        type="button"
                        onClick={() => moveUp(data.technicalSkills.indexOf(skill))}
                        disabled={data.technicalSkills.indexOf(skill) === 0}
                        title="Move Up"
                      >
                        <FiChevronUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(data.technicalSkills.indexOf(skill))}
                        disabled={
                          data.technicalSkills.indexOf(skill) === data.technicalSkills.length - 1
                        }
                        title="Move Down"
                      >
                        <FiChevronDown />
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => deleteSkill(skill.id)}
                      title="Delete skill category"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className={styles.collapsibleContent}>
                  <div className={styles.itemFields} style={{ marginTop: "1rem" }}>
                    <div className={styles.formGroup}>
                      <label htmlFor={`skill-title-${skill.id}`}>Title</label>
                      <input
                        id={`skill-title-${skill.id}`}
                        type="text"
                        value={skill.title}
                        onChange={(e) => updateSkill(skill.id, "title", e.target.value)}
                        placeholder="e.g., Languages, Backend, Frontend"
                      />
                      {errors?.[`skill_${skill.id}_title`] && (
                        <span className={styles.fieldError}>
                          {errors[`skill_${skill.id}_title`]}
                        </span>
                      )}
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
                      {errors?.[`skill_${skill.id}_description`] && (
                        <span className={styles.fieldError}>
                          {errors[`skill_${skill.id}_description`]}
                        </span>
                      )}
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
                            {tag.icon && <Icon name={tag.icon} size="s" />}
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
                          onChange={(e) =>
                            setTagInputs({ ...tagInputs, [skill.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag(skill.id);
                            }
                          }}
                          placeholder="Add new tech skill..."
                        />
                        <button
                          type="button"
                          className={styles.addBtn}
                          onClick={() => addTag(skill.id)}
                        >
                          <FiPlus />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className={styles.addBtn} onClick={addSkill}>
            <FiPlus />
            Add Skill Category
          </button>
        </div>
      </div>
    </section>
  );
}
