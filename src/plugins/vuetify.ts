import { createVuetify } from "vuetify";
import { VAvatar } from "vuetify/components/VAvatar";
import { VBtn } from "vuetify/components/VBtn";
import { VChip } from "vuetify/components/VChip";
import { VImg } from "vuetify/components/VImg";

export function createPortfolioVuetify() {
  return createVuetify({
    ssr: true,
    theme: false,
    components: {
      VAvatar,
      VBtn,
      VChip,
      VImg,
    },
    defaults: {
      VBtn: { elevation: 0, ripple: false },
    },
  });
}
