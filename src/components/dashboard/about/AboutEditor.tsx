"use client";

import {
  createEducation,
  createSocialLink,
  deleteEducation,
  deleteSocialLink,
  fetchAbout,
  fetchEducations,
  fetchSkills,
  fetchSocialLinks,
  fetchWorkExperiences,
  updateAbout,
  updateAvatar,
  updateSocialLink,
} from "@/lib/about";
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
      photo: profile?.avatar_url || person.avatar,
      links: (socialLinks || []).map((l) => ({ id: l.id, label: l.name, url: l.url })),
      workExperience: (workExps || []).map((w) => ({
        id: w.id,
        role: w.role,
        company: w.company,
        timeframe: w.timeframe,
        achievements: (w.achievements || []).map((a) => ({ id: a.id, content: a.content })),
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
        tags: (s.tags || []).map((t) => ({ id: t.id ?? "", name: t.name, icon: t.icon })),
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

  const syncSocialLinks = async () => {
    if (!accessToken || !originalData) return;

    const currentLinks = data.links;
    const oldLinks = originalData.links;

    // Detect Deletions
    const toDelete = oldLinks.filter((ol) => !currentLinks.find((cl) => cl.id === ol.id));
    for (const link of toDelete) {
      await deleteSocialLink(accessToken, link.id);
    }

    // Detect Changes & Additions
    for (let i = 0; i < currentLinks.length; i++) {
      const cl = currentLinks[i];
      const ol = oldLinks.find((o) => o.id === cl.id);

      if (!ol) {
        // ADD (IDs like Date.now() are temporary)
        await createSocialLink(accessToken, { name: cl.label, url: cl.url, order_by: i });
      } else if (cl.label !== ol.label || cl.url !== ol.url) {
        // UPDATE
        await updateSocialLink(accessToken, cl.id, { name: cl.label, url: cl.url, order_by: i });
      }
    }
  };

  const syncEducations = async () => {
    if (!accessToken || !originalData) return;

    const currentEdu = data.studies;
    const oldEdu = originalData.studies;

    // Delete
    const toDelete = oldEdu.filter((o) => !currentEdu.find((c) => c.id === o.id));
    for (const edu of toDelete) {
      await deleteEducation(accessToken, edu.id);
    }

    // Add
    const toAdd = currentEdu.filter((c) => !oldEdu.find((o) => o.id === c.id));
    for (const edu of toAdd) {
      await createEducation(accessToken, {
        institution: edu.institution,
        degree: edu.degree,
        period: edu.period,
        description: edu.description,
      });
    }
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
    try {
      // 1. Sync Basic Profile
      await updateAbout(accessToken, {
        name: data.name,
        role: data.title,
        description: data.description,
      });

      // 2. Sync Social Links
      await syncSocialLinks();

      // 3. Sync Education
      await syncEducations();

      alert("Profile, Social Links, and Education synchronized!");

      const refreshed = await fetchAllData();
      setOriginalData(refreshed);
      setData(refreshed);
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
        {isSyncing && <div className={styles.syncingOverlay}>Syncing...</div>}
      </header>

      <div className={styles.layout}>
        {/* LEFT COLUMN */}
        <div className={styles.column}>
          <BasicInfoSection data={data} setData={setData} handlePhotoUpload={handlePhotoUpload} />
          <SocialLinksSection data={data} setData={setData} />
          <TechnicalSkillsSection data={data} setData={setData} />
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.column}>
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
          Reset Changes
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSyncing}>
          {isSyncing ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
