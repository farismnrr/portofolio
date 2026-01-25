export const inferIconName = (name: string): string => {
  const lowerName = name.toLowerCase().replace(/\s+/g, "");

  // Common mappings
  const mappings: Record<string, string> = {
    // Languages & Tech
    go: "golang",
    "c++": "cplusplus",
    cpp: "cplusplus",
    "c#": "csharp",
    csharp: "csharp",
    "next.js": "nextjs",
    "node.js": "nodedotjs",
    nodejs: "nodedotjs",
    "vue.js": "vue",
    vuejs: "vue",
    "nuxt.js": "nuxt",
    nuxtjs: "nuxt",
    gcp: "googlecloud",
    aws: "aws",

    // Socials
    email: "email",
    github: "github",
    linkedin: "linkedin",
    google: "google",
    twitter: "twitter",
    x: "x",
    facebook: "facebook",
    instagram: "instagram",
    youtube: "youtube",
    discord: "discord",
    telegram: "telegram",
    whatsapp: "whatsapp",
  };

  if (mappings[lowerName]) return mappings[lowerName];

  // Default: try removing dots and special chars
  return lowerName.replace(/\./g, "").replace(/[^a-z0-9]/g, "");
};
