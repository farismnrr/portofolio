"use client";

import { FiUpload, FiUser } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData } from "../types";

interface BasicInfoSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function BasicInfoSection({
  data,
  setData,
  handlePhotoUpload,
}: BasicInfoSectionProps) {
  return (
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
  );
}
