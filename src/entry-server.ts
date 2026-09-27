import about from "virtual:content/about";
import blog from "virtual:content/blog";
import projects from "virtual:content/projects";
import { renderToString } from "@vue/server-renderer";
import { createSSRApp } from "vue";
import { createMemoryHistory } from "vue-router";
import App from "./App.vue";
import { createPortfolioRouter } from "./router";
import "./styles/main.scss";

const base = "https://farismnrr.com";

function esc(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char,
  );
}

function seoFor(url: string) {
  const clean = url.split("?")[0].replace(/\/$/, "") || "/";
  let title = "Faris Munir Mahdi — Software Engineer";
  let description =
    "Software Engineer specializing in backend architecture, cloud infrastructure, IoT systems, and intelligent software.";
  let image = "/images/og/home.jpg";

  if (clean === "/about") {
    title = "About — Faris Munir Mahdi";
    description = about.description;
  } else if (clean === "/projects") {
    title = "Projects — Faris Munir Mahdi";
    description =
      "Selected software engineering, IoT, AI, and platform projects by Faris Munir Mahdi.";
  } else if (clean.startsWith("/projects/")) {
    const slug = clean.split("/").pop();
    const project = projects.find((item) => item.slug === slug);
    if (project) {
      title = project.title;
      description = project.summary;
      image = project.images[0] || image;
    }
  } else if (clean === "/blog") {
    title = "Blog — Faris Munir Mahdi";
    description = "Engineering notes and technical writing by Faris Munir Mahdi.";
  } else if (clean.startsWith("/blog/")) {
    const slug = clean.split("/").pop();
    const post = blog.find((item) => item.slug === slug);
    if (post) {
      title = post.title;
      description = post.summary;
      image = post.image || image;
    }
  } else if (clean === "/certifications") {
    title = "Certifications — Faris Munir Mahdi";
    description = "Professional certifications and learning achievements.";
  } else if (clean === "/gallery") {
    title = "Gallery — Faris Munir Mahdi";
    description = "Photo gallery by Faris Munir Mahdi.";
  }

  const canonical = `${base}${clean === "/" ? "" : clean}`;
  const absoluteImage = image.startsWith("http") ? image : `${base}${image}`;
  return `<title>${esc(title)}</title>\n<meta name="description" content="${esc(description)}" />\n<link rel="canonical" href="${canonical}" />\n<meta property="og:title" content="${esc(title)}" />\n<meta property="og:description" content="${esc(description)}" />\n<meta property="og:url" content="${canonical}" />\n<meta property="og:image" content="${absoluteImage}" />\n<meta name="twitter:card" content="summary_large_image" />`;
}

export const staticRoutes = [
  "/",
  "/about",
  "/projects",
  "/blog",
  "/certifications",
  "/gallery",
  ...projects.map((item) => `/projects/${item.slug}`),
  ...blog.map((item) => `/blog/${item.slug}`),
];

export async function render(url: string) {
  const app = createSSRApp(App);
  const router = createPortfolioRouter(createMemoryHistory());
  app.use(router);
  await router.push(url);
  await router.isReady();
  return { html: await renderToString(app), head: seoFor(url) };
}
