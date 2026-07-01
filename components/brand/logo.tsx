import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LOGO_ICON = "/images/logo-icon.png";
const LOGO_FULL = "/images/logo-full.png";

type LogoVariant = "lockup" | "full" | "icon";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  href?: string | null;
};

export function Logo({ variant = "lockup", className, href = "/" }: LogoProps) {
  const content =
    variant === "full" ? (
      <Image
        src={LOGO_FULL}
        alt={APP_NAME}
        width={200}
        height={200}
        className={cn("h-auto w-36 object-contain sm:w-40", className)}
        priority
      />
    ) : variant === "icon" ? (
      <Image
        src={LOGO_ICON}
        alt={APP_NAME}
        width={40}
        height={40}
        className={cn("h-9 w-9 object-contain", className)}
        priority
      />
    ) : (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <Image
          src={LOGO_ICON}
          alt=""
          width={36}
          height={36}
          className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
          priority
          aria-hidden
        />
        <span className="font-display text-base font-semibold tracking-tight sm:text-lg">
          {APP_NAME}
        </span>
      </span>
    );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {content}
      </Link>
    );
  }

  return content;
}
