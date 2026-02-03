import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

type Team = {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
};

type Metadata = {
  title: string;
  projectName?: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tags: string[];
  team: Team[];
  link?: string;
  repository?: string;
  label?: string;
  backlink?: string;
};

import { notFound } from "next/navigation";

function getMDXFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    notFound();
  }

  try {
    const stdout = execSync(`find "${dir}" -maxdepth 2 -name "*.mdx"`).toString();
    return stdout
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => path.relative(dir, line));
  } catch (error) {
    console.error("Error finding MDX files:", error);
    return [];
  }
}

function readMDXFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  const seoPath = filePath.replace(".mdx", "-seo.yaml");
  let seoData: Record<string, string> = {};
  if (fs.existsSync(seoPath)) {
    try {
      const seoRaw = fs.readFileSync(seoPath, "utf-8");
      seoData = matter(`---\n${seoRaw}\n---`).data;
    } catch (error) {
      console.error(`Error parsing SEO file ${seoPath}:`, error);
    }
  }

  const metadata: Metadata = {
    title: seoData.title || data.title || "",
    projectName: data.projectName || "",
    subtitle: data.subtitle || "",
    publishedAt: data.publishedAt,
    summary: seoData.description || data.summary || "",
    image: data.image || "",
    images: data.images || [],
    tags: (seoData.tags
      ? seoData.tags.split(",")
      : data.tag
        ? Array.isArray(data.tag)
          ? data.tag
          : [data.tag]
        : []
    ).map((t: string) => t.trim()),
    team: data.team || [],
    link: seoData.backlink || data.link || "",
    repository: data.repository || "",
    label: seoData.label || "",
    backlink: seoData.backlink || "",
  };

  return { metadata, content };
}

export function getPosts(customPath: string[] = ["content", "projects"]) {
  const postsDirectory = path.join(process.cwd(), "src", ...customPath);
  const mdxFiles = getMDXFiles(postsDirectory);

  return mdxFiles
    .filter((file) => !file.includes(".example.")) // Filter out .example.mdx files
    .map((file) => {
      const { metadata, content } = readMDXFile(path.join(postsDirectory, file));
      const slug = path.basename(file, path.extname(file));

      return {
        metadata,
        slug,
        content,
      };
    });
}
