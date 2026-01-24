import { FiBriefcase, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, WorkAchievement, WorkExperience } from "../types";

interface WorkExperienceSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
}

export default function WorkExperienceSection({ data, setData }: WorkExperienceSectionProps) {
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      role: "",
      company: "",
      timeframe: "",
      achievements: [],
    };
    setData({ ...data, workExperience: [...data.workExperience, newExp] });
  };

  const updateWorkExperience = (
    id: string,
    field: keyof WorkExperience,
    value: string | WorkAchievement[],
  ) => {
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

  const addAchievement = (workId: string) => {
    const work = data.workExperience.find((w) => w.id === workId);
    if (work) {
      const newAchievement: WorkAchievement = {
        id: Date.now().toString(),
        content: "",
      };
      updateWorkExperience(workId, "achievements", [...work.achievements, newAchievement]);
    }
  };

  const updateAchievement = (workId: string, achievementId: string, content: string) => {
    const work = data.workExperience.find((w) => w.id === workId);
    if (work) {
      const newAchievements = work.achievements.map((a) =>
        a.id === achievementId ? { ...a, content } : a,
      );
      updateWorkExperience(workId, "achievements", newAchievements);
    }
  };

  const deleteAchievement = (workId: string, achievementId: string) => {
    const work = data.workExperience.find((w) => w.id === workId);
    if (work) {
      updateWorkExperience(
        workId,
        "achievements",
        work.achievements.filter((a) => a.id !== achievementId),
      );
    }
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
              <h4>{exp.role || "New Position"}</h4>
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
                <label htmlFor={`exp-role-${exp.id}`}>Job Title</label>
                <input
                  id={`exp-role-${exp.id}`}
                  type="text"
                  value={exp.role}
                  onChange={(e) => updateWorkExperience(exp.id, "role", e.target.value)}
                  placeholder="e.g., Senior Developer"
                />
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
              </div>
              <div className={styles.formGroup}>
                <label htmlFor={`exp-timeframe-${exp.id}`}>Period</label>
                <input
                  id={`exp-timeframe-${exp.id}`}
                  type="text"
                  value={exp.timeframe}
                  onChange={(e) => updateWorkExperience(exp.id, "timeframe", e.target.value)}
                  placeholder="e.g., 2020 - Present"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor={`achievements-${exp.id}`}>Achievements</label>
                <div id={`achievements-${exp.id}`} className={styles.achievementsList}>
                  {exp.achievements.map((ach) => (
                    <div key={ach.id} className={styles.achievementItem}>
                      <input
                        type="text"
                        value={ach.content}
                        onChange={(e) => updateAchievement(exp.id, ach.id, e.target.value)}
                        placeholder="Key achievement or responsibility..."
                      />
                      <button
                        type="button"
                        onClick={() => deleteAchievement(exp.id, ach.id)}
                        className={styles.miniDeleteBtn}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addAchievementBtn}
                    onClick={() => addAchievement(exp.id)}
                  >
                    <FiPlus /> Add Achievement
                  </button>
                </div>
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
