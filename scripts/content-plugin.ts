import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import type { Plugin } from "vite";

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
const PREFIX = "\0virtual:content/";

function walk(dir: string, exts = [".md"]): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(file, exts);
    return exts.includes(path.extname(entry.name).toLowerCase()) ? [file] : [];
  });
}

function directMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".md")
    .map((entry) => path.join(dir, entry.name));
}

function readMarkdown(file: string) {
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const body = parsed.content.trim();
  return { data: parsed.data, body, html: md.render(parsed.content) };
}

function sortByOrder<T extends Record<string, unknown>>(items: T[]): T[] {
  const orderOf = (item: T) => (typeof item.order === "number" ? item.order : 999);
  return items.sort((a, b) => orderOf(a) - orderOf(b));
}

function contentFor(root: string, domain: string) {
  const contentRoot = path.join(root, "src", "content");

  if (domain === "about") {
    const { data, body, html } = readMarkdown(path.join(contentRoot, "about", "index.md"));
    return { ...data, description: body, descriptionHtml: html };
  }

  if (domain === "work") {
    return sortByOrder(
      directMarkdownFiles(path.join(contentRoot, "work")).map((file) => {
        const { data, body, html } = readMarkdown(file);
        return {
          ...data,
          summary: data.summary ?? "",
          body,
          html,
        };
      }),
    );
  }

  if (domain === "studies") {
    return sortByOrder(
      directMarkdownFiles(path.join(contentRoot, "studies")).map((file) => {
        const { data, body, html } = readMarkdown(file);
        return { ...data, description: body, descriptionHtml: html };
      }),
    );
  }

  if (domain === "skills") {
    return sortByOrder(
      directMarkdownFiles(path.join(contentRoot, "skills")).map((file) => {
        const { data, body, html } = readMarkdown(file);
        return { ...data, description: body, descriptionHtml: html };
      }),
    );
  }

  if (domain === "projects") {
    return directMarkdownFiles(path.join(contentRoot, "projects"))
      .map((file) => {
        const { data, body, html } = readMarkdown(file);
        const slug = path.basename(file, ".md");
        return {
          slug,
          title: data.title ?? slug,
          projectName: data.projectName ?? data.title ?? slug,
          publishedAt: data.publishedAt ?? "",
          summary: data.summary ?? "",
          order: typeof data.order === "number" ? data.order : 999,
          organization: data.organization ?? "",
          role: data.role ?? "",
          images: data.images ?? [],
          link: data.link ?? "",
          repository: data.repository ?? "",
          tags: Array.isArray(data.tag) ? data.tag : data.tag ? [data.tag] : [],
          team: data.team ?? [],
          body,
          html,
        };
      })
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return (
          new Date(String(b.publishedAt || 0)).getTime() -
          new Date(String(a.publishedAt || 0)).getTime()
        );
      });
  }

  if (domain === "blog") {
    return directMarkdownFiles(path.join(contentRoot, "blog"))
      .map((file) => {
        const { data, body, html } = readMarkdown(file);
        return {
          slug: path.basename(file, ".md"),
          title: data.title ?? "",
          publishedAt: data.publishedAt ?? "",
          summary: data.summary ?? "",
          image: data.image ?? "",
          tags: Array.isArray(data.tag) ? data.tag : data.tag ? [data.tag] : [],
          body,
          html,
        };
      })
      .sort(
        (a, b) =>
          new Date(String(b.publishedAt || 0)).getTime() -
          new Date(String(a.publishedAt || 0)).getTime(),
      );
  }

  if (domain === "certifications") {
    const certRoot = path.join(root, "public", "images", "certifications");
    if (!fs.existsSync(certRoot)) return [];
    return fs
      .readdirSync(certRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((group) => {
        const dir = path.join(certRoot, group.name);
        return fs
          .readdirSync(dir)
          .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
          .map((name) => {
            const title = path.parse(name).name;
            const pdfName = `${title}.pdf`;
            return {
              group: group.name,
              title,
              image: `/images/certifications/${group.name}/${name}`,
              pdf: fs.existsSync(path.join(dir, pdfName))
                ? `/images/certifications/${group.name}/${pdfName}`
                : "",
            };
          });
      })
      .sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
  }

  if (domain === "gallery") {
    const galleryRoot = path.join(root, "public", "images", "gallery");
    if (!fs.existsSync(galleryRoot)) return [];
    return fs
      .readdirSync(galleryRoot)
      .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
      .sort()
      .map((name) => ({
        src: `/images/gallery/${name}`,
        alt: path.parse(name).name.replace(/[-_]/g, " "),
      }));
  }

  throw new Error(`Unknown content domain: ${domain}`);
}

export function portfolioContent(): Plugin {
  let root = process.cwd();
  return {
    name: "portfolio-content",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id.startsWith("virtual:content/") ? `\0${id}` : null;
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const domain = id.slice(PREFIX.length);
      for (const file of walk(path.join(root, "src", "content"))) this.addWatchFile(file);
      return `export default ${JSON.stringify(contentFor(root, domain))};`;
    },
  };
}