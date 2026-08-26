import { HalloweenAtmosphere } from "@/components/halloween/halloween-atmosphere";

export function HalloweenCatalogFrame({
  eyebrow,
  lead,
  children,
}: {
  eyebrow: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="halloween-theme relative min-h-[70vh] overflow-hidden">
      <HalloweenAtmosphere />

      <div className="relative z-10 mx-auto max-w-7xl px-2 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <header className="relative mb-8 max-w-2xl px-2 sm:mb-10 sm:px-0">
          <div className="mb-4 flex items-center gap-2 text-amber-300/80" aria-hidden="true">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-amber-200/75">
            {eyebrow}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-200/80 sm:text-base">
            {lead}
          </p>
        </header>

        <div className="halloween-catalog-surface rounded-2xl border border-white/10 bg-[rgba(18,12,24,0.58)] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-md sm:rounded-3xl sm:p-5 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
