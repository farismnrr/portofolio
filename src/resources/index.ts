import {
  about,
  blog,
  certifications,
  gallery,
  home,
  newsletter,
  person,
  projects as projectsData,
  social,
} from "./content_DEPRECATED";

const projects = {
  ...projectsData,
  path: "/projects",
  label: "Projects",
};

export {
  baseURL,
  dataStyle,
  display,
  effects,
  fonts,
  mailchimp,
  protectedRoutes,
  routes,
  sameAs,
  schema,
  socialSharing,
  style,
} from "./once-ui.config";
export { about, blog, certifications, gallery, home, newsletter, person, projects, social };
