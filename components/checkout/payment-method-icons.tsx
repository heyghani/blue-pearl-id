import { cn } from "@/lib/utils";

export function PayPalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 20"
      aria-hidden
      className={cn("h-5 w-auto", className)}
      role="img"
    >
      <title>PayPal</title>
      <path
        fill="#003087"
        d="M18.4 2.4h-6.8c-.5 0-.9.3-1 .8L8.1 15.8c-.1.3.1.6.4.6h3.2c.3 0 .6-.2.6-.5l.6-3.8c.1-.5.5-.8 1-.8h2.1c4.4 0 6.9-2.1 7.6-6.3.3-1.8 0-3.2-.9-4.2-.9-1-2.5-1.4-4.7-1.4zm.7 6.2c-.4 2.4-2.2 2.4-4 2.4h-1l.7-4.5c0-.2.2-.4.5-.4h.5c1.2 0 2.3 0 2.9.7.4.4.5 1 .4 1.8z"
      />
      <path
        fill="#009CDE"
        d="M32.5 2.4h-6.8c-.5 0-.9.3-1 .8L22.2 15.8c-.1.3.1.6.4.6h3c.3 0 .5-.2.6-.5l.2-1.2c.1-.5.5-.8 1-.8h2.1c4.4 0 6.9-2.1 7.6-6.3.3-1.8 0-3.2-.9-4.2-.9-1-2.5-1.4-4.7-1.4h-2.5c-.5 0-.9.3-1 .8l-1.1 7.1z"
      />
      <path
        fill="#003087"
        d="M46.8 2.4h-6.8c-.5 0-.9.3-1 .8L36.5 15.8c-.1.3.1.6.4.6h3.2c.3 0 .6-.2.6-.5l.6-3.8c.1-.5.5-.8 1-.8h2.1c4.4 0 6.9-2.1 7.6-6.3.3-1.8 0-3.2-.9-4.2-.9-1-2.5-1.4-4.7-1.4h-2.5c-.5 0-.9.3-1 .8l-1.1 7.1z"
      />
    </svg>
  );
}

export function MidtransMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 20"
      aria-hidden
      className={cn("h-5 w-auto", className)}
      role="img"
    >
      <title>Midtrans</title>
      <rect x="0" y="2" width="26" height="16" rx="3" fill="#00AEEF" />
      <rect x="4" y="6" width="8" height="6" rx="1" fill="#fff" opacity="0.95" />
      <rect x="14" y="6" width="8" height="6" rx="1" fill="#fff" opacity="0.75" />
      <text
        x="32"
        y="14"
        fill="currentColor"
        fontSize="11"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Midtrans
      </text>
    </svg>
  );
}

export function CardMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 20"
      aria-hidden
      className={cn("h-5 w-auto text-ink", className)}
      role="img"
    >
      <title>Card</title>
      <rect x="0" y="1" width="32" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="0" y="5" width="32" height="4" fill="currentColor" opacity="0.85" />
      <rect x="4" y="12" width="10" height="2" rx="1" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
