import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";

export default function createEmotionCache() {
  return createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin],
  });
}
