import type { RouterHistory } from "vue-router";
import { createRouter } from "vue-router";
import AboutPage from "./pages/AboutPage.vue";
import BlogDetailPage from "./pages/BlogDetailPage.vue";
import BlogPage from "./pages/BlogPage.vue";
import CertificationsPage from "./pages/CertificationsPage.vue";
import GalleryPage from "./pages/GalleryPage.vue";
import HomePage from "./pages/HomePage.vue";
import NotFoundPage from "./pages/NotFoundPage.vue";
import ProjectDetailPage from "./pages/ProjectDetailPage.vue";
import ProjectsPage from "./pages/ProjectsPage.vue";

export function createPortfolioRouter(history: RouterHistory) {
  return createRouter({
    history,
    scrollBehavior(to) {
      if (to.hash) return { el: to.hash, behavior: "smooth" };
      return { top: 0 };
    },
    routes: [
      { path: "/", component: HomePage },
      { path: "/about", component: AboutPage },
      { path: "/projects", component: ProjectsPage },
      { path: "/projects/:slug", component: ProjectDetailPage },
      { path: "/blog", component: BlogPage },
      { path: "/blog/:slug", component: BlogDetailPage },
      { path: "/certifications", component: CertificationsPage },
      { path: "/gallery", component: GalleryPage },
      { path: "/:pathMatch(.*)*", component: NotFoundPage },
    ],
  });
}
