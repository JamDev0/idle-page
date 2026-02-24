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
          "radial-gradient(ellipse at 25% 50%, transparent 40%, rgba(28,14,14,0.42) 100%)",
      }}
    />
  );
}

function VerticalLabel({ text }: { text: string }) {
  return (
    <p
      className="text-[9px] uppercase tracking-[0.35em] text-red-950/25"
      style={{ writingMode: "vertical-rl" }}
    >
      {text}
    </p>
  );
}

export default function Variation4() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#241414]">
      <FilmGrain />

      <div className="pointer-events-none absolute -right-40 top-1/4 h-[600px] w-[600px] rounded-full bg-red-700/[0.18] blur-[200px]" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-[350px] w-[350px] rounded-full bg-red-600/[0.10] blur-[140px]" />

      <Vignette />

      <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[1fr_minmax(0,420px)_1fr]">
        {/* Left gutter with vertical text */}
        <div className="hidden items-center justify-center lg:flex">
          <VerticalLabel text="Photography Darkroom" />
        </div>

        {/* Narrow center column — the "canister label" */}
        <div className="flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-0">
          <div className="flex flex-col gap-10">
            <header>
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-red-700/20" />
                <p className="font-mono text-[9px] text-red-950/30">
                  IDLE-001
                </p>
              </div>

              <h1 className="mt-5 text-3xl font-extralight leading-[1.1] tracking-tight text-red-200/80 sm:text-4xl">
                Frame
                <br />
                by frame
              </h1>

              <p className="mt-5 text-sm leading-relaxed text-red-300/40">
                A desktop idle screen that rotates your media collection and
                tracks tasks from a synced file. Quiet by design.
              </p>
            </header>

            <div className="h-px w-full bg-red-950/15" />

            <nav className="flex flex-col gap-4">
              {[
                {
                  n: "01",
                  title: "Media Rotation",
                  desc: "Cycle images and video. Navigate at your own pace.",
                },
                {
                  n: "02",
                  title: "Task Checklist",
                  desc: "Markdown-synced, file-watched, read-only aware.",
                },
                {
                  n: "03",
                  title: "Live Sync",
                  desc: "Disk changes propagate instantly. No refresh.",
                },
              ].map((item) => (
                <div key={item.n} className="group flex gap-4">
                  <span className="mt-0.5 font-mono text-[10px] text-red-950/30">
                    {item.n}
                  </span>
                  <div className="flex-1 border-b border-red-950/10 pb-4">
                    <p className="text-sm text-red-200/65 transition-colors group-hover:text-red-200/85">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-red-900/40">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <Link
                href="/"
                className="rounded-sm bg-red-900/20 px-6 py-2.5 text-sm text-red-300/70 transition-colors hover:bg-red-800/30"
              >
                Open Darkroom
              </Link>
              <Link
                href="/settings"
                className="text-xs text-red-900/35 transition-colors hover:text-red-500"
              >
                configure
              </Link>
            </div>

            <footer className="flex items-center justify-between pt-4">
              <p className="text-[9px] text-red-950/20">Idle Page</p>
              <p className="font-mono text-[8px] text-red-950/18">v0.1.0</p>
            </footer>
          </div>
        </div>

        {/* Right gutter with decorative elements */}
        <div className="relative hidden lg:block">
          <div className="absolute right-12 top-12 flex items-center gap-2">
            <VerticalLabel text="Idle Page" />
          </div>

          {/* Aperture-style decorative circle */}
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 rounded-full border border-red-800/10" />
              <div className="absolute inset-3 rounded-full border border-red-800/8" />
              <div className="absolute inset-6 rounded-full border border-red-800/6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-red-700/15" />
              </div>
            </div>
          </div>

          {/* Film edge markers */}
          <div className="absolute bottom-12 right-12 flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-1 w-6 rounded-full bg-red-900/12"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
