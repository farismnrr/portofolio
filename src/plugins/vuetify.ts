import "vuetify/styles";
import { createVuetify } from "vuetify";
import { VAvatar } from "vuetify/components/VAvatar";
import { VBtn } from "vuetify/components/VBtn";
import { VImg } from "vuetify/components/VImg";

export function createPortfolioVuetify() {
  return createVuetify({
    ssr: true,
    theme: false,
    components: {
      VAvatar,
      VBtn,
      VImg,
    },
    defaults: {
      VBtn: { elevation: 0, ripple: false },
    },
  });
}
