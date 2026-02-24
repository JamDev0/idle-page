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
          "radial-gradient(ellipse at 60% 40%, transparent 35%, rgba(28,14,14,0.42) 100%)",
      }}
    />
  );
}

export default function Variation5() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#241414]">
      <FilmGrain />

      <div className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-red-700/[0.18] blur-[180px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-red-600/[0.12] blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[300px] w-[300px] rounded-full bg-red-800/[0.06] blur-[200px]" />

      <Vignette />

      {/* Background typographic layer — large ghost text */}
      <div
        className="pointer-events-none absolute left-[5%] top-[15%] z-[5] select-none text-[18vw] font-extralight leading-none tracking-tighter text-red-900/[0.04]"
        aria-hidden="true"
      >
        IDLE
      </div>
      <div
        className="pointer-events-none absolute bottom-[10%] right-[8%] z-[5] select-none text-[12vw] font-extralight leading-none tracking-tighter text-red-800/[0.03]"
        aria-hidden="true"
      >
        PAGE
      </div>

      {/* Main content layer */}
      <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 gap-8 px-6 py-12 sm:px-12 lg:grid-cols-12 lg:gap-0 lg:px-0 lg:py-0">
        {/* Left column — metadata strip */}
        <div className="flex flex-col justify-between border-r border-red-950/10 py-8 lg:col-span-2 lg:py-16 lg:pl-8 lg:pr-6">
          <div className="flex flex-col gap-3">
            <p className="text-[9px] uppercase tracking-[0.3em] text-red-900/40">
              Darkroom
            </p>
            <div className="h-px w-8 bg-red-700/15" />
            <p className="font-mono text-[8px] text-red-950/25">
              EXP &mdash; 001
            </p>
          </div>

          <div className="hidden flex-col gap-4 lg:flex">
            {["Media", "Tasks", "Watch", "Focus"].map((item) => (
              <p
                key={item}
                className="text-[9px] uppercase tracking-[0.2em] text-red-950/25"
              >
                {item}
              </p>
            ))}
          </div>

          <p className="hidden font-mono text-[8px] text-red-950/18 lg:block">
            v0.1.0
          </p>
        </div>

        {/* Center column — primary content */}
        <div className="flex flex-col justify-center lg:col-span-6 lg:px-12 lg:py-16">
          <div className="max-w-lg">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px w-12 bg-red-700/20" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-red-700/40">
                Double Exposure
              </p>
            </div>

            <h1 className="text-4xl font-extralight leading-[1.05] tracking-tight text-red-200/80 sm:text-5xl lg:text-6xl">
              Two layers,
              <br />
              <span className="text-red-400/65">one frame</span>
            </h1>

            <p className="mt-6 max-w-[40ch] text-sm leading-relaxed text-red-300/40">
              Your media and your tasks, fused into a single idle screen. A
              desktop companion that respects your attention by filling the quiet
              moments with what you choose.
            </p>

            <div className="mt-10 flex items-center gap-5">
              <Link
                href="/"
                className="group relative overflow-hidden rounded-sm border border-red-700/20 bg-red-900/15 px-7 py-2.5 text-sm text-red-300/70 backdrop-blur-sm transition-all duration-300 hover:border-red-600/35 hover:bg-red-800/25"
              >
                <span className="relative z-10">Expose</span>
                <div className="absolute inset-0 -translate-x-full bg-red-600/8 transition-transform duration-500 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/settings"
                className="text-xs text-red-900/35 transition-colors hover:text-red-500"
              >
                settings
              </Link>
            </div>
          </div>
        </div>

        {/* Right column — overlapping feature cards */}
        <div className="relative flex flex-col justify-center gap-4 lg:col-span-4 lg:pr-12 lg:py-16">
          {[
            {
              n: "I",
              title: "Media Rotation",
              desc: "Images and videos cycle through your curated collection.",
              offset: "lg:translate-x-0",
            },
            {
              n: "II",
              title: "Task Tracking",
              desc: "File-backed checklist that syncs from disk changes.",
              offset: "lg:-translate-x-6",
            },
            {
              n: "III",
              title: "Ambient Display",
              desc: "Designed to be beautiful when no one is watching.",
              offset: "lg:translate-x-0",
            },
          ].map((card) => (
            <div
              key={card.n}
              className={`rounded-sm border border-red-900/12 bg-[#241414]/50 p-5 backdrop-blur-sm transition-colors hover:border-red-800/20 ${card.offset}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] text-red-950/30">
                  {card.n}
                </span>
                <div className="h-px w-8 bg-red-900/10" />
              </div>
              <h3 className="text-sm text-red-200/65">{card.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-red-900/40">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-red-950/10 px-8 py-4 lg:px-12">
        <p className="text-[9px] text-red-950/20">
          Idle Page &mdash; Darkroom Aesthetic
        </p>
        <div className="flex items-center gap-6 text-[9px] text-red-950/20">
          <span>Next.js 15</span>
          <div className="h-2 w-px bg-red-950/10" />
          <span>React 19</span>
        </div>
      </div>
    </main>
  );
}
