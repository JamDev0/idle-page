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
          "radial-gradient(ellipse at center, transparent 45%, rgba(28,14,14,0.38) 100%)",
      }}
    />
  );
}

function FrameNumber({ n }: { n: string }) {
  return (
    <span className="font-mono text-[8px] tracking-wider text-red-950/30">
      {n}
    </span>
  );
}

function ContactCell({
  children,
  className = "",
  frame,
}: {
  children: React.ReactNode;
  className?: string;
  frame: string;
}) {
  return (
    <div
      className={`group relative border border-red-900/12 bg-[#241414]/40 p-5 backdrop-blur-sm transition-colors hover:border-red-800/20 sm:p-6 ${className}`}
    >
      <div className="absolute right-3 top-3">
        <FrameNumber n={frame} />
      </div>
      {children}
    </div>
  );
}

export default function Variation2() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#241414]">
      <FilmGrain />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-red-800/[0.10] blur-[220px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-red-600/[0.14] blur-[160px]" />

      <Vignette />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center gap-3 pl-1">
          <div className="h-px w-8 bg-red-700/25" />
          <p className="text-[9px] uppercase tracking-[0.3em] text-red-900/45">
            Contact Sheet &mdash; Proof
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px lg:grid-cols-[2fr_1fr_1fr]">
          <ContactCell frame="01A" className="lg:row-span-2">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-red-700/40">
                  Idle Page
                </p>
                <h1 className="mt-4 text-3xl font-extralight leading-tight tracking-tight text-red-200/80 sm:text-4xl lg:text-5xl">
                  Your proof sheet
                  <br />
                  <span className="text-red-400/70">for the day</span>
                </h1>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-red-300/40">
                  A desktop companion that rotates your media and keeps your
                  tasks visible. Every frame, every note, under the warm glow of
                  a safe light.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-5">
                <Link
                  href="/"
                  className="rounded-sm bg-red-900/25 px-6 py-2 text-sm text-red-300/75 transition-colors hover:bg-red-800/35"
                >
                  Develop
                </Link>
                <Link
                  href="/settings"
                  className="text-xs text-red-900/40 transition-colors hover:text-red-500"
                >
                  settings
                </Link>
              </div>
            </div>
          </ContactCell>

          <ContactCell frame="02A">
            <div className="flex flex-col gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-800/20">
                <div className="h-2 w-2 rounded-full bg-red-700/40" />
              </div>
              <h3 className="text-sm font-medium text-red-200/70">
                Media Rotation
              </h3>
              <p className="text-xs leading-relaxed text-red-900/50">
                Images and videos cycle at your pace. No rush, no interruption.
              </p>
            </div>
          </ContactCell>

          <ContactCell frame="03A">
            <div className="flex flex-col gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-800/20">
                <div className="h-px w-3 bg-red-700/40" />
              </div>
              <h3 className="text-sm font-medium text-red-200/70">
                Checklist
              </h3>
              <p className="text-xs leading-relaxed text-red-900/50">
                Track what needs doing. Changes sync from disk automatically.
              </p>
            </div>
          </ContactCell>

          <ContactCell frame="04A">
            <div className="flex flex-col gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-800/20">
                <svg
                  className="h-3 w-3 text-red-700/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-red-200/70">
                File Watching
              </h3>
              <p className="text-xs leading-relaxed text-red-900/50">
                Edit your files externally. The darkroom updates in real time.
              </p>
            </div>
          </ContactCell>

          <ContactCell frame="05A">
            <div className="flex items-center justify-between">
              <p className="text-[10px] italic text-red-300/30">
                &ldquo;In the darkroom, time dissolves.&rdquo;
              </p>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 w-px bg-red-950/15" />
                ))}
              </div>
            </div>
          </ContactCell>
        </div>

        <div className="mt-6 flex items-center justify-between px-1">
          <p className="text-[9px] text-red-950/25">
            Idle Page &mdash; Darkroom
          </p>
          <p className="font-mono text-[9px] text-red-950/20">v0.1.0</p>
        </div>
      </div>
    </main>
  );
}
