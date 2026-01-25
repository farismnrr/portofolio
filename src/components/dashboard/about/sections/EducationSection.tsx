"use client";

import { FiBook, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, Study } from "../types";

interface EducationSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  errors?: Record<string, string>;
}

export default function EducationSection({ data, setData, errors }: EducationSectionProps) {
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
    <section className={styles.section}>
      <h2>
        <FiBook />
        Education
      </h2>

      <div className={styles.studiesList}>
        {data.studies.map((study) => (
          <div key={study.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <h4>{study.institution || "New Institution"}</h4>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => deleteStudy(study.id)}
                title="Delete education"
              >
                <FiTrash2 />
              </button>
            </div>
            <div className={styles.itemFields}>
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
                  <span className={styles.fieldError}>{errors[`edu_${study.id}_degree`]}</span>
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
                  <span className={styles.fieldError}>{errors[`edu_${study.id}_institution`]}</span>
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
                  <span className={styles.fieldError}>{errors[`edu_${study.id}_period`]}</span>
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
                  <span className={styles.fieldError}>{errors[`edu_${study.id}_description`]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addBtn} onClick={addStudy}>
          <FiPlus />
          Add Education
        </button>
      </div>
    </section>
  );
}
