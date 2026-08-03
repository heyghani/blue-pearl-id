import { prisma } from "@/lib/db";
import { FALLBACK_DEFAULT_BASE_PRICE } from "@/lib/store-defaults";

export const STORE_SETTING_ID = "default";

export async function getStoreSettings() {
  const existing = await prisma.storeSetting.findUnique({
    where: { id: STORE_SETTING_ID },
  });

  if (existing) return existing;

  return prisma.storeSetting.create({
    data: {
      id: STORE_SETTING_ID,
      defaultBasePrice: FALLBACK_DEFAULT_BASE_PRICE,
    },
  });
}

export async function getDefaultBasePrice(): Promise<number> {
  const settings = await getStoreSettings();
  return Number(settings.defaultBasePrice);
}

export async function updateDefaultBasePrice(defaultBasePrice: number) {
  return prisma.storeSetting.upsert({
    where: { id: STORE_SETTING_ID },
    update: { defaultBasePrice },
    create: {
      id: STORE_SETTING_ID,
      defaultBasePrice,
    },
  });
}
