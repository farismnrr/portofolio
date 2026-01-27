"use client";

import Image from "next/image";
import { useState } from "react";
import { FiChevronDown, FiUpload, FiUser } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData } from "../types";

interface BasicInfoSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  errors?: Record<string, string>;
}

export default function BasicInfoSection({
  data,
  setData,
  handlePhotoUpload,
  errors,
}: BasicInfoSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className={`${styles.section} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sectionHeader}>
        <h2>
          <FiUser />
          Basic Information
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
        <div className={styles.photoUpload} style={{ marginTop: "1.5rem" }}>
          <div className={styles.photoPreview}>
            {data.photo ? (
              <Image
                src={data.photo}
                alt="Profile"
                width={80}
                height={80}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                unoptimized // Since source is unknown user upload
              />
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
          {errors?.name && <span className={styles.fieldError}>{errors.name}</span>}
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
          {errors?.role && <span className={styles.fieldError}>{errors.role}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            placeholder="Tell us about yourself"
          />
          {errors?.description && <span className={styles.fieldError}>{errors.description}</span>}
        </div>
      </div>
    </section>
  );
}
