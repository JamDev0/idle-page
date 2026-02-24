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
          "radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(28,14,14,0.40) 100%)",
      }}
    />
  );
}

function FilmStripDecoration() {
  return (
    <div className="hidden lg:flex flex-col items-center gap-0 opacity-[0.15]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-5 rounded-[1px] border border-red-400/30" />
          <div className="h-20 w-px bg-red-700/20" />
          <div className="h-3 w-5 rounded-[1px] border border-red-400/30" />
        </div>
      ))}
    </div>
  );
}

export default function Variation1() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#241414]">
      <FilmGrain />

      <div className="pointer-events-none absolute -left-32 top-1/3 h-[600px] w-[600px] rounded-full bg-red-700/[0.22] blur-[200px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-red-600/[0.12] blur-[150px]" />

      <Vignette />

      <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col justify-center px-8 py-20 sm:px-12 lg:px-20">
          <div className="max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.35em] text-red-900/50">
              001 &mdash; Idle Page
            </p>

            <div className="my-6 h-px w-12 bg-red-700/25" />

            <h1 className="text-4xl font-extralight leading-[1.08] tracking-tight text-red-200/80 sm:text-5xl lg:text-6xl">
              Step into
              <br />
              the darkroom
            </h1>

            <p className="mt-6 max-w-[42ch] text-sm leading-relaxed text-red-300/40">
              A quiet desktop companion for rotating your media and tracking
              what matters. Built for stillness, designed around the analog
              warmth of a photography darkroom.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <Link
                href="/"
                className="group relative overflow-hidden rounded-sm border border-red-700/25 bg-red-900/15 px-7 py-2.5 text-sm text-red-300/70 backdrop-blur-sm transition-all duration-300 hover:border-red-600/40 hover:bg-red-800/25"
              >
                <span className="relative z-10">Enter</span>
                <div className="absolute inset-0 -translate-x-full bg-red-700/10 transition-transform duration-500 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/settings"
                className="text-xs text-red-900/40 transition-colors hover:text-red-500"
              >
                configure
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-8 text-[9px] uppercase tracking-[0.2em] text-red-950/35">
              <span>Media</span>
              <div className="h-px w-6 bg-red-950/15" />
              <span>Checklist</span>
              <div className="h-px w-6 bg-red-950/15" />
              <span>Focus</span>
            </div>
          </div>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <FilmStripDecoration />

          <div className="absolute right-12 top-12">
            <p className="text-[9px] tracking-[0.15em] text-red-950/25">
              v0.1.0
            </p>
          </div>

          <div className="absolute bottom-16 right-16 flex flex-col items-end gap-2">
            <div className="h-px w-24 bg-gradient-to-l from-red-700/20 to-transparent" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-red-950/30">
              Photography Darkroom
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
