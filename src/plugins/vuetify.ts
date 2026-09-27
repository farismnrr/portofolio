import "vuetify/styles";
import { createVuetify } from "vuetify";

export function createPortfolioVuetify() {
  return createVuetify({
    ssr: true,
    theme: false,
    defaults: {
      VBtn: { elevation: 0, ripple: false },
      VCard: { elevation: 0 },
    },
  });
}
