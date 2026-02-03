import { baseURL, routes as routesConfig } from "@/resources";
import { getPosts } from "@/utils/utils";

export default async function sitemap() {
  const blogs = getPosts(["content", "blog"]).map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const projects = getPosts(["content", "projects"]).map((post) => ({
    url: `${baseURL}/projects/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...projects];
}
