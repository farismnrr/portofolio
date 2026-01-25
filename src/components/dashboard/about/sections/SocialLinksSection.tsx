"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiLink, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../AboutEditor.module.scss";
import type { AboutData, Link } from "../types";

interface SocialLinksSectionProps {
  data: AboutData;
  setData: (data: AboutData) => void;
  errors?: Record<string, string>;
}

export default function SocialLinksSection({ data, setData, errors }: SocialLinksSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addLink = () => {
    const newLink: Link = {
      id: Date.now().toString(),
      label: "",
      url: "",
      icon: "",
      order_by: data.links.length,
    };
    setData({ ...data, links: [...data.links, newLink] });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...data.links];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    setData({ ...data, links: newLinks });
  };

  const moveDown = (index: number) => {
    if (index === data.links.length - 1) return;
    const newLinks = [...data.links];
    [newLinks[index + 1], newLinks[index]] = [newLinks[index], newLinks[index + 1]];
    setData({ ...data, links: newLinks });
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
    <section className={`${styles.section} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sectionHeader}>
        <h2>
          <FiLink />
          Social Links
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
        <div className={styles.linksList} style={{ marginTop: "1.5rem" }}>
          {data.links.map((link) => (
            <div key={link.id} className={styles.linkItem}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <button
                  type="button"
                  className={styles.moveBtn}
                  onClick={() => moveUp(data.links.indexOf(link))}
                  disabled={data.links.indexOf(link) === 0}
                  title="Move Up"
                >
                  <FiChevronUp />
                </button>
                <button
                  type="button"
                  className={styles.moveBtn}
                  onClick={() => moveDown(data.links.indexOf(link))}
                  disabled={data.links.indexOf(link) === data.links.length - 1}
                  title="Move Down"
                >
                  <FiChevronDown />
                </button>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor={`link-label-${link.id}`}>Label</label>
                <input
                  id={`link-label-${link.id}`}
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(link.id, "label", e.target.value)}
                  placeholder="e.g., GitHub"
                />
                {errors?.[`link_${link.id}_name`] && (
                  <span className={styles.fieldError}>{errors[`link_${link.id}_name`]}</span>
                )}
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
                {errors?.[`link_${link.id}_link`] && (
                  <span className={styles.fieldError}>{errors[`link_${link.id}_link`]}</span>
                )}
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
      </div>
    </section>
  );
}
