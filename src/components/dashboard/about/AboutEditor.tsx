"use client";

import { about, person, social } from "@/resources";
import { useState } from "react";
import {
  FiBook,
  FiBriefcase,
  FiCode,
  FiLink,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiUser,
} from "react-icons/fi";
import styles from "./AboutEditor.module.scss";

interface Link {
  id: string;
  label: string;
  url: string;
}

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Study {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
}

interface TechTag {
  name: string;
  icon?: string;
}

interface TechnicalSkill {
  id: string;
  title: string;
  description: string;
  tags: TechTag[];
}

interface AboutData {
  photo: string;
  name: string;
  title: string;
  description: string;
  links: Link[];
  workExperience: WorkExperience[];
  studies: Study[];
  technicalSkills: TechnicalSkill[];
}

export default function AboutEditor() {
  // Convert social links to Link format
  const initialLinks: Link[] = social
    .filter((item) => item.link)
    .map((item, index) => ({
      id: (index + 1).toString(),
      label: item.name,
      url: item.link || "",
    }));

  // Convert work experiences to WorkExperience format
  const initialWorkExperience: WorkExperience[] = about.work.experiences.map((exp, index) => ({
    id: (index + 1).toString(),
    title: exp.role,
    company: exp.company,
    period: exp.timeframe,
    description: exp.achievements.join("\n"),
  }));

  // Convert studies to Study format
  const initialStudies: Study[] = about.studies.institutions.map((inst, index) => {
    // Extract text from React element description
    let descriptionText = "";
    if (typeof inst.description === "string") {
      descriptionText = inst.description;
    } else if (inst.description && typeof inst.description === "object") {
      // Try to extract text from React element
      const desc = inst.description as unknown as {
        props?: { children?: string | unknown[] };
      };
      if (desc.props?.children) {
        if (typeof desc.props.children === "string") {
          descriptionText = desc.props.children;
        } else if (Array.isArray(desc.props.children)) {
          descriptionText = desc.props.children
            .map((child: unknown) => {
              if (typeof child === "string") return child;
              const childObj = child as { props?: { children?: string } };
              if (childObj.props?.children) {
                return typeof childObj.props.children === "string" ? childObj.props.children : "";
              }
              return "";
            })
            .join(" ");
        }
      }
    }

    return {
      id: (index + 1).toString(),
      degree: inst.name,
      institution: inst.name,
      period: (inst as { period?: string }).period || "",
      description: descriptionText,
    };
  });

  // Extract technical skills with full structure
  const initialSkills: TechnicalSkill[] = about.technical.skills.map((skill, index) => {
    // Extract description text from React element
    let descriptionText = "";
    if (typeof skill.description === "string") {
      descriptionText = skill.description;
    } else if (skill.description && typeof skill.description === "object") {
      const desc = skill.description as unknown as {
        props?: { children?: string | unknown[] };
      };
      if (desc.props?.children) {
        if (typeof desc.props.children === "string") {
          descriptionText = desc.props.children;
        } else if (Array.isArray(desc.props.children)) {
          descriptionText = desc.props.children
            .map((child: unknown) => {
              if (typeof child === "string") return child;
              const childObj = child as { props?: { children?: string } };
              if (childObj.props?.children) {
                return typeof childObj.props.children === "string" ? childObj.props.children : "";
              }
              return "";
            })
            .join(" ");
        }
      }
    }

    return {
      id: (index + 1).toString(),
      title: skill.title,
      description: descriptionText,
      tags: skill.tags || [],
    };
  });

  const [data, setData] = useState<AboutData>({
    photo: person.avatar,
    name: person.name,
    title: person.role,
    description:
      typeof about.intro.description === "string"
        ? about.intro.description
        : "Software Engineer specializing in backend architecture, cloud infrastructure, and IoT systems.",
    links: initialLinks,
    workExperience: initialWorkExperience,
    studies: initialStudies,
    technicalSkills: initialSkills,
  });

  // State to track new tag input for each skill category
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    const newLink: Link = {
      id: Date.now().toString(),
      label: "",
      url: "",
    };
    setData({ ...data, links: [...data.links, newLink] });
  };

  const updateLink = (id: string, field: keyof Link, value: string) => {
    setData({
      ...data,
      links: data.links.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    });
  };

  const deleteLink = (id: string) => {
    setData({
      ...data,
      links: data.links.filter((link) => link.id !== id),
    });
  };

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
      aws: "aws", // aws is mapped to SiAmazonwebservices in icons.ts but key is aws
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
        skill.tags.filter((_, i) => i !== tagIndex)
      );
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving data:", data);
  };

  const handleCancel = () => {
    // TODO: Implement cancel/reset functionality
    console.log("Canceling changes");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>About Editor</h1>
        <p>Manage your profile information, experience, and skills.</p>
      </header>

      <div className={styles.layout}>
        {/* LEFT COLUMN */}
        <div>
          {/* BASIC INFO */}
          <section className={styles.section}>
            <h2>
              <FiUser />
              Basic Information
            </h2>

            <div className={styles.photoUpload}>
              <div className={styles.photoPreview}>
                {data.photo ? (
                  <img src={data.photo} alt="Profile" />
                ) : (
                  <div className={styles.placeholder}>{data.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <label htmlFor="photo-upload" className={styles.uploadBtn}>
                <FiUpload />
                Upload Photo
              </label>
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                placeholder="Your professional title"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                placeholder="Tell us about yourself"
              />
            </div>
          </section>

          {/* LINKS */}
          <section className={styles.section}>
            <h2>
              <FiLink />
              Social Links
            </h2>

            <div className={styles.linksList}>
              {data.links.map((link) => (
                <div key={link.id} className={styles.linkItem}>
                  <div className={styles.formGroup}>
                    <label htmlFor={`link-label-${link.id}`}>Label</label>
                    <input
                      id={`link-label-${link.id}`}
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(link.id, "label", e.target.value)}
                      placeholder="e.g., GitHub"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor={`link-url-${link.id}`}>URL</label>
                    <input
                      id={`link-url-${link.id}`}
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteLink(link.id)}
                    title="Delete link"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={addLink}>
                <FiPlus />
                Add Link
              </button>
            </div>
          </section>

          {/* TECHNICAL SKILLS */}
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
              ))}
              <button type="button" className={styles.addBtn} onClick={addSkill}>
                <FiPlus />
                Add Skill Category
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* WORK EXPERIENCE */}
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
                      <label htmlFor={`exp-period-${exp.id}`}>Period</label>
                      <input
                        id={`exp-period-${exp.id}`}
                        type="text"
                        value={exp.period}
                        onChange={(e) => updateWorkExperience(exp.id, "period", e.target.value)}
                        placeholder="e.g., 2020 - Present"
                      />
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

          {/* STUDIES */}
          <section className={styles.section}>
            <h2>
              <FiBook />
              Education
            </h2>

            <div className={styles.studiesList}>
              {data.studies.map((study) => (
                <div key={study.id} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <h4>{study.degree || "New Degree"}</h4>
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
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`study-description-${study.id}`}>Description</label>
                      <textarea
                        id={`study-description-${study.id}`}
                        value={study.description}
                        onChange={(e) => updateStudy(study.id, "description", e.target.value)}
                        placeholder="Additional details about your education"
                      />
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
        </div>
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
