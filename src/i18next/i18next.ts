import i18next from "i18next";
import { translations } from "./translations";

export const loadLocale = async () => {
  await i18next.init({
    // fallbackLng: "en",
    resources: translations,
  });
};

export default i18next.t;
