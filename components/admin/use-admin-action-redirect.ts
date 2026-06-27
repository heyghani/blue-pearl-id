"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAdminActionRedirect(state: { redirectTo?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state.redirectTo, router]);
}
