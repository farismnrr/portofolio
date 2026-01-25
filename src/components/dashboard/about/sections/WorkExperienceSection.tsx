"use client";

import { useState } from "react";
import { FiBriefcase, FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, WorkExperience } from "../types";

interface WorkExperienceSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  errors?: Record<string, string>;
}

export default function WorkExperienceSection({
  data,
  setData,
  errors,
}: WorkExperienceSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCollapsedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      period: "",
      description: "",
      order_by: data.workExperience.length,
    };
    setData({ ...data, workExperience: [...data.workExperience, newExp] });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newExp = [...data.workExperience];
    [newExp[index - 1], newExp[index]] = [newExp[index], newExp[index - 1]];
    setData({ ...data, workExperience: newExp });
  };

  const moveDown = (index: number) => {
    if (index === data.workExperience.length - 1) return;
    const newExp = [...data.workExperience];
    [newExp[index + 1], newExp[index]] = [newExp[index], newExp[index + 1]];
    setData({ ...data, workExperience: newExp });
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setData({
      ...data,
      workExperience: data.workExperience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    });
  };

  const deleteWorkExperience = (id: string) => {
    setData({
      ...data,
      workExperience: data.workExperience.filter((exp) => exp.id !== id),
    });
  };

  return (
    <section className={`${styles.section} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sectionHeader}>
        <h2>
          <FiBriefcase />
          Work Experience
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
        <div className={styles.experienceList} style={{ marginTop: "1.5rem" }}>
          {data.workExperience.map((exp) => {
            const isItemCollapsed = collapsedItems[exp.id];
            return (
              <div
                key={exp.id}
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
                    onClick={() => toggleItem(exp.id)}
                    aria-label={isItemCollapsed ? "Expand position" : "Collapse position"}
                  >
                    <FiChevronDown
                      style={{
                        transition: "transform 0.3s ease",
                        transform: isItemCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                        color: "var(--neutral-on-background-weak)",
                        fontSize: "1.25rem",
                      }}
                    />
                    <h4 style={{ margin: 0 }}>{exp.title || "New Position"}</h4>
                  </button>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div className={styles.reorderBtns}>
                      <button
                        type="button"
                        onClick={() => moveUp(data.workExperience.indexOf(exp))}
                        disabled={data.workExperience.indexOf(exp) === 0}
                        title="Move Up"
                      >
                        <FiChevronUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(data.workExperience.indexOf(exp))}
                        disabled={
                          data.workExperience.indexOf(exp) === data.workExperience.length - 1
                        }
                        title="Move Down"
                      >
                        <FiChevronDown />
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => deleteWorkExperience(exp.id)}
                      title="Delete experience"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className={styles.collapsibleContent}>
                  <div className={styles.itemFields} style={{ marginTop: "1rem" }}>
                    <div className={styles.formGroup}>
                      <label htmlFor={`exp-title-${exp.id}`}>Job Title</label>
                      <input
                        id={`exp-title-${exp.id}`}
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateWorkExperience(exp.id, "title", e.target.value)}
                        placeholder="e.g., Senior Developer"
                      />
                      {errors?.[`work_${exp.id}_role`] && (
                        <span className={styles.fieldError}>{errors[`work_${exp.id}_role`]}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`exp-company-${exp.id}`}>Company</label>
                      <input
                        id={`exp-company-${exp.id}`}
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                        placeholder="e.g., Tech Corp"
                      />
                      {errors?.[`work_${exp.id}_company`] && (
                        <span className={styles.fieldError}>
                          {errors[`work_${exp.id}_company`]}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`exp-period-${exp.id}`}>Period</label>
                      <input
                        id={`exp-period-${exp.id}`}
                        type="text"
                        value={exp.period}
                        onChange={(e) => updateWorkExperience(exp.id, "period", e.target.value)}
                        placeholder="e.g., 2020 - Present"
                      />
                      {errors?.[`work_${exp.id}_timeframe`] && (
                        <span className={styles.fieldError}>
                          {errors[`work_${exp.id}_timeframe`]}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`exp-description-${exp.id}`}>Description</label>
                      <textarea
                        id={`exp-description-${exp.id}`}
                        value={exp.description}
                        onChange={(e) =>
                          updateWorkExperience(exp.id, "description", e.target.value)
                        }
                        placeholder="Describe your role and achievements"
                      />
                      {errors?.[`work_${exp.id}_description`] && (
                        <span className={styles.fieldError}>
                          {errors[`work_${exp.id}_description`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className={styles.addBtn} onClick={addWorkExperience}>
            <FiPlus />
            Add Experience
          </button>
        </div>
      </div>
    </section>
  );
}
