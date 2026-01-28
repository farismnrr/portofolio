import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { AboutProfile, Education, SkillCategory, WorkExperience } from "./types";

// Constants defining content directories
const CONTENT_DIR = path.join(process.cwd(), "src/content");
const ABOUT_FILE = path.join(CONTENT_DIR, "about", "index.md");
const WORK_DIR = path.join(CONTENT_DIR, "work");
const STUDIES_DIR = path.join(CONTENT_DIR, "studies");
const TECHNICAL_DIR = path.join(CONTENT_DIR, "technical");

export async function getAbout(): Promise<AboutProfile | null> {
  if (!fs.existsSync(ABOUT_FILE)) return null;
  const fileContent = fs.readFileSync(ABOUT_FILE, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    ...data,
    description: content,
  } as AboutProfile;
}

export async function getSocialLinks() {
  const about = await getAbout();
  return about?.social || [];
}

export async function getWorkExperiences(): Promise<WorkExperience[]> {
  if (!fs.existsSync(WORK_DIR)) return [];

  const files = fs.readdirSync(WORK_DIR).filter((file) => file.endsWith(".md"));

  const experiences = files.map((file) => {
    const fileContent = fs.readFileSync(path.join(WORK_DIR, file), "utf-8");
    const { data } = matter(fileContent);
    return data as WorkExperience;
  });

  return experiences.sort((a, b) => a.order - b.order);
}

export async function getEducations(): Promise<Education[]> {
  if (!fs.existsSync(STUDIES_DIR)) return [];

  const files = fs.readdirSync(STUDIES_DIR).filter((file) => file.endsWith(".md"));

  const educations = files.map((file) => {
    const fileContent = fs.readFileSync(path.join(STUDIES_DIR, file), "utf-8");
    const { data, content } = matter(fileContent);
    return {
      ...data,
      description: content.trim(),
    } as Education;
  });

  return educations.sort((a, b) => a.order - b.order);
}

export async function getSkills(): Promise<SkillCategory[]> {
  if (!fs.existsSync(TECHNICAL_DIR)) return [];

  const files = fs.readdirSync(TECHNICAL_DIR).filter((file) => file.endsWith(".md"));

  const skills = files.map((file) => {
    const fileContent = fs.readFileSync(path.join(TECHNICAL_DIR, file), "utf-8");
    const { data, content } = matter(fileContent);
    return {
      ...data,
      description: content.trim(),
    } as SkillCategory;
  });

  return skills.sort((a, b) => a.order - b.order);
}
