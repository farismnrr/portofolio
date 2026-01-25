"use client";

import { useState } from "react";
import { FiBook, FiChevronDown, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, Study } from "../types";

interface EducationSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  errors?: Record<string, string>;
}

export default function EducationSection({ data, setData, errors }: EducationSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCollapsedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addStudy = () => {
    const newStudy: Study = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      period: "",
      description: "",
    };
    setData({ ...data, studies: [...data.studies, newStudy] });
  };

  const updateStudy = (id: string, field: keyof Study, value: string) => {
    setData({
      ...data,
      studies: data.studies.map((study) =>
        study.id === id ? { ...study, [field]: value } : study,
      ),
    });
  };

  const deleteStudy = (id: string) => {
    setData({
      ...data,
      studies: data.studies.filter((study) => study.id !== id),
    });
  };

  return (
    <section className={`${styles.section} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sectionHeader}>
        <h2>
          <FiBook />
          Education
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
        <div className={styles.studiesList} style={{ marginTop: "1.5rem" }}>
          {data.studies.map((study) => {
            const isItemCollapsed = collapsedItems[study.id];
            return (
              <div
                key={study.id}
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
                    onClick={() => toggleItem(study.id)}
                    aria-label={isItemCollapsed ? "Expand study" : "Collapse study"}
                  >
                    <FiChevronDown
                      style={{
                        transition: "transform 0.3s ease",
                        transform: isItemCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                        color: "var(--neutral-on-background-weak)",
                        fontSize: "1.25rem",
                      }}
                    />
                    <h4 style={{ margin: 0 }}>{study.institution || "New Institution"}</h4>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteStudy(study.id)}
                    title="Delete education"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className={styles.collapsibleContent}>
                  <div className={styles.itemFields} style={{ marginTop: "1rem" }}>
                    <div className={styles.formGroup}>
                      <label htmlFor={`study-degree-${study.id}`}>Degree</label>
                      <input
                        id={`study-degree-${study.id}`}
                        type="text"
                        value={study.degree}
                        onChange={(e) => updateStudy(study.id, "degree", e.target.value)}
                        placeholder="e.g., Computer Science"
                      />
                      {errors?.[`edu_${study.id}_degree`] && (
                        <span className={styles.fieldError}>
                          {errors[`edu_${study.id}_degree`]}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`study-institution-${study.id}`}>Institution</label>
                      <input
                        id={`study-institution-${study.id}`}
                        type="text"
                        value={study.institution}
                        onChange={(e) => updateStudy(study.id, "institution", e.target.value)}
                        placeholder="e.g., University of Technology"
                      />
                      {errors?.[`edu_${study.id}_institution`] && (
                        <span className={styles.fieldError}>
                          {errors[`edu_${study.id}_institution`]}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`study-period-${study.id}`}>Period</label>
                      <input
                        id={`study-period-${study.id}`}
                        type="text"
                        value={study.period}
                        onChange={(e) => updateStudy(study.id, "period", e.target.value)}
                        placeholder="e.g., 2016 - 2020"
                      />
                      {errors?.[`edu_${study.id}_period`] && (
                        <span className={styles.fieldError}>
                          {errors[`edu_${study.id}_period`]}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`study-description-${study.id}`}>Description</label>
                      <textarea
                        id={`study-description-${study.id}`}
                        value={study.description}
                        onChange={(e) => updateStudy(study.id, "description", e.target.value)}
                        placeholder="Additional details about your education"
                      />
                      {errors?.[`edu_${study.id}_description`] && (
                        <span className={styles.fieldError}>
                          {errors[`edu_${study.id}_description`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className={styles.addBtn} onClick={addStudy}>
            <FiPlus />
            Add Education
          </button>
        </div>
      </div>
    </section>
  );
}
