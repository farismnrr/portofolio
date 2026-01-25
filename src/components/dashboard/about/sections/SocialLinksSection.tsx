"use client";

import { FiLink, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, Link } from "../types";

interface SocialLinksSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  errors?: Record<string, string>;
}

export default function SocialLinksSection({ data, setData, errors }: SocialLinksSectionProps) {
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

  return (
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
              {errors?.name && <span className={styles.fieldError}>{errors.name}</span>}
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
              {errors?.link && <span className={styles.fieldError}>{errors.link}</span>}
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
  );
}
