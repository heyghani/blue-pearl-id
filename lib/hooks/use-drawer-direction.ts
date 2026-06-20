"use client";

import { useEffect, useRef, useState } from "react";

export type DrawerDirection = "bottom" | "right";

function getDirection(): DrawerDirection {
  if (typeof window === "undefined") return "bottom";
  return window.matchMedia("(min-width: 768px)").matches ? "right" : "bottom";
}

/** Lock drawer direction for the duration of an open session to avoid layout glitches. */
export function useDrawerDirection(open: boolean): DrawerDirection {
  const [direction, setDirection] = useState<DrawerDirection>("bottom");
  const locked = useRef<DrawerDirection | null>(null);

  useEffect(() => {
    if (open) {
      if (!locked.current) {
        locked.current = getDirection();
        setDirection(locked.current);
      }
      return;
    }

    locked.current = null;
    setDirection(getDirection());
  }, [open]);

  return direction;
}
