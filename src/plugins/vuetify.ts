import "vuetify/styles";
import { createVuetify } from "vuetify";
import {
  VApp,
  VAvatar,
  VBtn,
  VCard,
  VChip,
  VCol,
  VContainer,
  VDivider,
  VFooter,
  VImg,
  VMain,
  VRow,
  VSheet,
} from "vuetify/components";

export type ThemeMode = "light" | "dark";

export function createPortfolioVuetify(defaultTheme: ThemeMode = "light") {
  return createVuetify({
    ssr: true,
    components: {
      VApp,
      VAvatar,
      VBtn,
      VCard,
      VChip,
      VCol,
      VContainer,
      VDivider,
      VFooter,
      VImg,
      VMain,
      VRow,
      VSheet,
    },
    theme: {
      defaultTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            background: "#ffffff",
            surface: "#ffffff",
            primary: "#0a0a0a",
            secondary: "#00a8d6",
            accent: "#ff3157",
            "on-background": "#0a0a0a",
            "on-surface": "#0a0a0a",
            "on-primary": "#ffffff",
          },
        },
        dark: {
          dark: true,
          colors: {
            background: "#090b0c",
            surface: "#111415",
            primary: "#f4f6f7",
            secondary: "#48d6ef",
            accent: "#ff5a75",
            "on-background": "#f4f6f7",
            "on-surface": "#f4f6f7",
            "on-primary": "#090b0c",
          },
        },
      },
    },
  });
}
