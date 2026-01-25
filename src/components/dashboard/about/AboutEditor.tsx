"use client";

import {
  type MutationResult,
  type SkillTag,
  createEducation,
  createSkillCategory,
  createSocialLink,
  createWorkExperience,
  deleteEducation,
  deleteSkillCategory,
  deleteSocialLink,
  deleteWorkExperience,
  fetchAbout,
  fetchEducations,
  fetchSkills,
  fetchSocialLinks,
  fetchWorkExperiences,
  updateAbout,
  updateAvatar,
  updateSocialLink,
} from "@/lib/about";
import { inferIconName } from "@/lib/utils/icons";
import { person } from "@/resources";
import { useAuthStore } from "@/store/auth";
import { useCallback, useEffect, useState } from "react";
import styles from "./AboutEditor.module.scss";

// Types
import type { AboutData } from "./types";

// Sections
import BasicInfoSection from "./sections/BasicInfoSection";
import EducationSection from "./sections/EducationSection";
import SocialLinksSection from "./sections/SocialLinksSection";
import TechnicalSkillsSection from "./sections/TechnicalSkillsSection";
import WorkExperienceSection from "./sections/WorkExperienceSection";

export default function AboutEditor() {
  const { accessToken } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [originalData, setOriginalData] = useState<AboutData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState<AboutData>({
    photo: person.avatar,
    name: person.name,
    title: person.role,
    description: "",
    links: [],
    workExperience: [],
    studies: [],
    technicalSkills: [],
  });

  // Transform raw API data to AboutData for state
  const fetchAllData = useCallback(async (): Promise<AboutData> => {
    const [profile, socialLinks, workExps, educations, skills] = await Promise.all([
      fetchAbout(),
      fetchSocialLinks(),
      fetchWorkExperiences(),
      fetchEducations(),
      fetchSkills(),
    ]);

    const mappedData: AboutData = {
      name: profile?.name || person.name,
      title: profile?.role || person.role,
      description: profile?.description || "",
      photo: profile?.avatar || person.avatar,
      links: (socialLinks || []).map((l) => ({
        id: l.id,
        label: l.name,
        url: l.link,
        icon: l.icon,
      })),
      workExperience: (workExps || []).map((w) => ({
        id: w.id,
        title: w.role,
        company: w.company,
        period: w.timeframe,
        description: w.description || "",
      })),
      studies: (educations || []).map((e) => ({
        id: e.id,
        degree: e.degree,
        institution: e.institution,
        period: e.period,
        description: e.description,
      })),
      technicalSkills: (skills || []).map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description || "",
        tags: (s.tags || []).map((t) => ({ name: t.name, icon: t.icon })),
      })),
    };

    return mappedData;
  }, []);

  useEffect(() => {
    async function initData() {
      if (!accessToken) return;
      setIsSyncing(true);
      try {
        const fetchedData = await fetchAllData();
        setData(fetchedData);
        setOriginalData(fetchedData);
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setIsSyncing(false);
      }
    }
    initData();
  }, [accessToken, fetchAllData]);

  const syncSocialLinks = async (): Promise<Record<string, string>> => {
    if (!accessToken || !originalData) return {};

    const currentLinks = data.links;
    const oldLinks = originalData.links;
    const errors: Record<string, string> = {};

    // Detect Deletions
    const toDelete = oldLinks.filter((ol) => !currentLinks.find((cl) => cl.id === ol.id));
    for (const link of toDelete) {
      await deleteSocialLink(accessToken, link.id);
    }

    // Detect Changes & Additions
    for (let i = 0; i < currentLinks.length; i++) {
      const cl = currentLinks[i];
      const ol = oldLinks.find((o) => o.id === cl.id);

      let res: MutationResult;
      if (!ol) {
        res = await createSocialLink(accessToken, {
          name: cl.label,
          link: cl.url,
          icon: inferIconName(cl.label),
          order_by: i,
        });
      } else if (cl.label !== ol.label || cl.url !== ol.url) {
        res = await updateSocialLink(accessToken, cl.id, {
          name: cl.label,
          link: cl.url,
          icon: inferIconName(cl.label),
          order_by: i,
        });
      } else {
        continue;
      }

      if (!res.success && res.errors) {
        for (const e of res.errors) {
          errors[`link_${cl.id}_${e.field}`] = e.message;
        }
      }
    }
    return errors;
  };

  const syncEducations = async (): Promise<Record<string, string>> => {
    if (!accessToken || !originalData) return {};

    const currentEdu = data.studies;
    const oldEdu = originalData.studies;
    const errors: Record<string, string> = {};

    // Delete
    const toDelete = oldEdu.filter((o) => !currentEdu.find((c) => c.id === o.id));
    for (const edu of toDelete) {
      await deleteEducation(accessToken, edu.id);
    }

    // Add
    const toAdd = currentEdu.filter((c) => !oldEdu.find((o) => o.id === c.id));
    for (const edu of toAdd) {
      const res = await createEducation(accessToken, {
        institution: edu.institution,
        degree: edu.degree,
        period: edu.period,
        description: edu.description,
      });

      if (!res.success && res.errors) {
        for (const e of res.errors) {
          errors[`edu_${edu.id}_${e.field}`] = e.message;
        }
      }
    }
    return errors;
  };

  const syncWorkExperiences = async (): Promise<Record<string, string>> => {
    if (!accessToken || !originalData) return {};

    const currentWork = data.workExperience;
    const oldWork = originalData.workExperience;
    const errors: Record<string, string> = {};

    // Delete
    const toDelete = oldWork.filter((o) => !currentWork.find((c) => c.id === o.id));
    for (const work of toDelete) {
      await deleteWorkExperience(accessToken, work.id);
    }

    // Add (Simplified: recreate from textarea lines)
    const toAdd = currentWork.filter((c) => !oldWork.find((o) => o.id === c.id));
    for (const work of toAdd) {
      const res = await createWorkExperience(accessToken, {
        company: work.company,
        role: work.title,
        timeframe: work.period,
        description: work.description,
      });

      if (!res.success && res.errors) {
        for (const e of res.errors) {
          errors[`work_${work.id}_${e.field}`] = e.message;
        }
      }
    }
    return errors;
  };

  const syncSkills = async (): Promise<Record<string, string>> => {
    if (!accessToken || !originalData) return {};

    const currentSkills = data.technicalSkills;
    const oldSkills = originalData.technicalSkills;
    const errors: Record<string, string> = {};

    // Delete
    const toDelete = oldSkills.filter((o) => !currentSkills.find((c) => c.id === o.id));
    for (const skill of toDelete) {
      await deleteSkillCategory(accessToken, skill.id);
    }

    // Add
    const toAdd = currentSkills.filter((c) => !oldSkills.find((o) => o.id === c.id));
    for (const skill of toAdd) {
      const res = await createSkillCategory(accessToken, {
        title: skill.title,
        description: skill.description,
        tags: skill.tags.map((t, i) => ({
          name: t.name,
          icon: t.icon,
          order_by: i,
        })) as unknown as SkillTag[],
      });

      if (!res.success && res.errors) {
        for (const e of res.errors) {
          errors[`skill_${skill.id}_${e.field}`] = e.message;
        }
      }
    }
    return errors;
  };

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
    if (!accessToken || !originalData) return;

    setIsSyncing(true);
    setValidationErrors({});

    try {
      const allErrors: Record<string, string> = {};

      // 1. Sync Basic Profile
      const aboutRes = await updateAbout(accessToken, {
        name: data.name,
        role: data.title,
        description: data.description,
        avatar: data.photo,
      });

      if (!aboutRes.success && aboutRes.errors) {
        for (const e of aboutRes.errors) {
          allErrors[e.field] = e.message;
        }
      }

      // 2. Sync Social Links
      const linkErrors = await syncSocialLinks();
      Object.assign(allErrors, linkErrors);

      // 3. Sync Education
      const eduErrors = await syncEducations();
      Object.assign(allErrors, eduErrors);

      // 4. Sync Work
      const workErrors = await syncWorkExperiences();
      Object.assign(allErrors, workErrors);

      // 5. Sync Skills
      const skillErrors = await syncSkills();
      Object.assign(allErrors, skillErrors);

      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors);
        alert("Some updates failed validation. Please check the form.");
      } else {
        alert("Profile and all sections synchronized!");
        const refreshed = await fetchAllData();
        setOriginalData(refreshed);
        setData(refreshed);
      }
    } catch (err) {
      console.error("Sync failed:", err);
      alert("Sync failed. Check console.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setData(JSON.parse(JSON.stringify(originalData)));
    }
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
          <BasicInfoSection
            data={data}
            setData={setData}
            handlePhotoUpload={handlePhotoUpload}
            errors={validationErrors}
          />
          <SocialLinksSection data={data} setData={setData} errors={validationErrors} />
          <TechnicalSkillsSection data={data} setData={setData} errors={validationErrors} />
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <WorkExperienceSection data={data} setData={setData} errors={validationErrors} />
          <EducationSection data={data} setData={setData} errors={validationErrors} />
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
