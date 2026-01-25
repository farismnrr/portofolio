"use client";

import { FiBriefcase, FiPlus, FiTrash2 } from "react-icons/fi";
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
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      period: "",
      description: "",
    };
    setData({ ...data, workExperience: [...data.workExperience, newExp] });
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
    <section className={styles.section}>
      <h2>
        <FiBriefcase />
        Work Experience
      </h2>

      <div className={styles.experienceList}>
        {data.workExperience.map((exp) => (
          <div key={exp.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <h4>{exp.title || "New Position"}</h4>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => deleteWorkExperience(exp.id)}
                title="Delete experience"
              >
                <FiTrash2 />
              </button>
            </div>
            <div className={styles.itemFields}>
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
                  <span className={styles.fieldError}>{errors[`work_${exp.id}_company`]}</span>
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
                  <span className={styles.fieldError}>{errors[`work_${exp.id}_timeframe`]}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor={`exp-description-${exp.id}`}>Description</label>
                <textarea
                  id={`exp-description-${exp.id}`}
                  value={exp.description}
                  onChange={(e) => updateWorkExperience(exp.id, "description", e.target.value)}
                  placeholder="Describe your role and achievements"
                />
                {errors?.[`work_${exp.id}_description`] && (
                  <span className={styles.fieldError}>{errors[`work_${exp.id}_description`]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addWorkExperience}>
          <FiPlus />
          Add Experience
        </button>
      </div>
    </section>
  );
}
