import { MetaPixel } from "@/components/analytics/meta-pixel";
import { getMetaPixelAdvancedMatching } from "@/lib/analytics/meta-advanced-matching";

/** Server wrapper: loads session user PII, hashes it, passes to client Pixel. */
export async function MetaPixelRoot() {
  const advancedMatching = await getMetaPixelAdvancedMatching();
  return <MetaPixel advancedMatching={advancedMatching} />;
}
