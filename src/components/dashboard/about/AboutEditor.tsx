"use client";

import { fetchAbout, updateAbout, updateAvatar } from "@/lib/about";
import { about, person, social } from "@/resources";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import styles from "./AboutEditor.module.scss";

// Types
import type { AboutData, Link, Study, TechnicalSkill, WorkExperience } from "./types";

// Sections
import BasicInfoSection from "./sections/BasicInfoSection";
import EducationSection from "./sections/EducationSection";
import SocialLinksSection from "./sections/SocialLinksSection";
import TechnicalSkillsSection from "./sections/TechnicalSkillsSection";
import WorkExperienceSection from "./sections/WorkExperienceSection";

export default function AboutEditor() {
  const { accessToken } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial Data Conversion (Legacy Resources Mapping)
  const initialLinks: Link[] = social
    .filter((item) => item.link)
    .map((item, index) => ({
      id: (index + 1).toString(),
      label: item.name,
      url: item.link || "",
    }));

  const initialWorkExperience: WorkExperience[] = about.work.experiences.map((exp, index) => ({
    id: (index + 1).toString(),
    title: exp.role,
    company: exp.company,
    period: exp.timeframe,
    description: exp.achievements.join("\n"),
  }));

  const initialStudies: Study[] = about.studies.institutions.map((inst, index) => {
    let descriptionText = "";
    if (typeof inst.description === "string") {
      descriptionText = inst.description;
    } else if (inst.description && typeof inst.description === "object") {
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

  const initialSkills: TechnicalSkill[] = about.technical.skills.map((skill, index) => {
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

  useEffect(() => {
    async function initData() {
      if (!accessToken) return;

      const profile = await fetchAbout();
      if (profile) {
        setData((prev) => ({
          ...prev,
          name: profile.name,
          title: profile.role,
          description: profile.description,
          photo: profile.avatar_url || prev.photo,
        }));
      }
    }
    initData();
  }, [accessToken]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && accessToken) {
      setIsSyncing(true);
      const url = await updateAvatar(accessToken, file);
      if (url) {
        setData({ ...data, photo: url });
      }
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken) return;

    setIsSyncing(true);
    const success = await updateAbout(accessToken, {
      name: data.name,
      role: data.title,
      description: data.description,
    });

    if (success) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile.");
    }
    setIsSyncing(false);
  };

  const handleCancel = () => {
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>About Editor</h1>
        <p>Manage your profile information, experience, and skills.</p>
        {isSyncing && <div className={styles.syncingOverlay}>Saving...</div>}
      </header>

      <div className={styles.layout}>
        {/* LEFT COLUMN */}
        <div>
          <BasicInfoSection data={data} setData={setData} handlePhotoUpload={handlePhotoUpload} />

          <SocialLinksSection data={data} setData={setData} />

          <TechnicalSkillsSection data={data} setData={setData} />
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <WorkExperienceSection data={data} setData={setData} />

          <EducationSection data={data} setData={setData} />
        </div>
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleCancel}
          disabled={isSyncing}
        >
          Cancel
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSyncing}>
          {isSyncing ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
