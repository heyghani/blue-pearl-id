"use client";

import dynamic from "next/dynamic";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

export const MobileNavLazy = dynamic(
  () => import("@/components/layout/mobile-nav").then((mod) => mod.MobileNav),
  {
    ssr: false,
    loading: () => (
      <div className="md:hidden">
        <Button variant="ghost" size="icon" aria-label="Open menu" disabled>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    ),
  },
);
