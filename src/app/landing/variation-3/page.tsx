import Link from "next/link";

function FilmGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 mix-blend-overlay opacity-[0.06]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function Vignette() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-20"
      style={{
        background:
          "radial-gradient(ellipse at 50% 80%, transparent 35%, rgba(28,14,14,0.45) 100%)",
      }}
    />
  );
}

export default function Variation3() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#241414]">
      <FilmGrain />

      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-red-700/[0.20] blur-[200px]" />
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[300px] w-[300px] rounded-full bg-red-600/[0.08] blur-[140px]" />

      <Vignette />

      {/* Sparse top zone — single vertical line dropping from ceiling */}
      <div className="pointer-events-none absolute left-[15%] top-0 z-10 hidden lg:block">
        <div className="h-[35vh] w-px bg-gradient-to-b from-red-700/15 via-red-700/8 to-transparent" />
      </div>
      <div className="pointer-events-none absolute right-[20%] top-0 z-10 hidden lg:block">
        <div className="flex flex-col items-center gap-2 pt-8">
          <div className="h-2 w-2 rounded-full border border-red-800/15" />
          <div className="h-[20vh] w-px bg-gradient-to-b from-red-800/10 to-transparent" />
        </div>
      </div>

      {/* Content anchored to the bottom third */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-6 pb-12 sm:px-12 lg:px-20 lg:pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-red-700/40" />
              <p className="text-[9px] uppercase tracking-[0.3em] text-red-900/40">
                Still developing
              </p>
            </div>

            <h1 className="text-4xl font-extralight leading-[1.05] tracking-tight text-red-200/80 sm:text-5xl lg:text-7xl">
              The image appears
              <br />
              <span className="text-red-400/60">when it&apos;s ready</span>
            </h1>

            <div className="mt-8 h-px w-20 bg-red-700/20" />

            <p className="mt-6 max-w-md text-sm leading-relaxed text-red-300/40">
              A desktop companion that gives your idle screen purpose. Rotate
              through your collection, track your tasks, and let the quiet do
              the rest.
            </p>

            <div className="mt-8 flex items-center gap-5">
              <Link
                href="/"
                className="rounded-sm border border-red-700/20 bg-red-900/15 px-7 py-2.5 text-sm text-red-300/70 transition-all duration-300 hover:border-red-600/35 hover:bg-red-800/25"
              >
                Begin
              </Link>
              <Link
                href="/settings"
                className="text-xs text-red-900/35 transition-colors hover:text-red-500"
              >
                settings
              </Link>
            </div>
          </div>

          <div className="hidden flex-col items-end gap-6 lg:flex">
            <div className="flex flex-col gap-4 text-right">
              {[
                { label: "Media", detail: "Images, video, rotation" },
                { label: "Tasks", detail: "File-synced checklist" },
                { label: "Watch", detail: "Live disk changes" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-red-200/60">{item.label}</p>
                    <p className="text-[10px] text-red-950/35">{item.detail}</p>
                  </div>
                  <div className="h-px w-4 bg-red-900/20" />
                </div>
              ))}
            </div>

            <p className="mt-4 font-mono text-[8px] text-red-950/20">
              v0.1.0
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex items-center gap-4 border-t border-red-950/15 pt-4 lg:mt-16">
          <p className="text-[9px] text-red-950/25">
            Idle Page
          </p>
          <div className="h-px flex-1 bg-red-950/8" />
          <p className="text-[9px] text-red-950/20">Darkroom Aesthetic</p>
        </div>
      </div>
    </main>
  );
}
