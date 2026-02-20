"use client";

import Link from "next/link";

const VARIANTS = [
  {
    id: 1,
    name: "Cosmos",
    description: "Deep space, floating elements, starfield",
    gradient: "from-[#020014] via-[#0a0025] to-[#050020]",
    accent: "text-indigo-400",
  },
  {
    id: 2,
    name: "Terminal",
    description: "Retro CRT, green phosphor, monospace",
    gradient: "from-[#0a0a0a] via-[#0a0f0a] to-[#0a0a0a]",
    accent: "text-green-400",
  },
  {
    id: 3,
    name: "Darkroom",
    description: "Photography safe-light, film grain, red wash",
    gradient: "from-[#0c0404] via-[#120606] to-[#0c0404]",
    accent: "text-red-500",
  },
  {
    id: 4,
    name: "Isometric",
    description: "Geometric 3D grid, bold angles, coral & teal",
    gradient: "from-[#f8f6f1] via-[#f0ece4] to-[#f8f6f1]",
    accent: "text-[#e87461]",
  },
  {
    id: 5,
    name: "Zen Garden",
    description: "Japanese minimalism, sand, stone, moss",
    gradient: "from-[#eee8dc] via-[#e6e0d4] to-[#eee8dc]",
    accent: "text-[#7c8c6e]",
  },
  {
    id: 6,
    name: "Polaroid",
    description: "Instant photo frames, warm nostalgic tones",
    gradient: "from-[#f4ede4] via-[#efe6da] to-[#f4ede4]",
    accent: "text-amber-500",
  },
  {
    id: 7,
    name: "Blueprint",
    description: "Technical schematic, blue grid, engineering",
    gradient: "from-[#1a2a40] via-[#1e3050] to-[#1a2a40]",
    accent: "text-[#7ab0e0]",
  },
  {
    id: 8,
    name: "Vinyl",
    description: "Record store warmth, amber glow, retro audio",
    gradient: "from-[#1a1410] via-[#201a14] to-[#1a1410]",
    accent: "text-amber-500",
  },
  {
    id: 9,
    name: "Topographic",
    description: "Contour lines, terrain palette, field notes",
    gradient: "from-[#e8e0d0] via-[#e0d8c8] to-[#e8e0d0]",
    accent: "text-[#7a9a6a]",
  },
];

export default function IndexPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 py-16">
      <h1 className="mb-2 text-3xl font-light tracking-tight text-neutral-100">Idle Page</h1>
      <p className="mb-12 text-sm text-neutral-500">Choose your experience</p>

      <div className="grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {VARIANTS.map((v) => (
          <Link
            key={v.id}
            href={`/${v.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800 transition-all hover:border-neutral-600 hover:shadow-lg hover:shadow-neutral-900/50"
          >
            <div className={`h-24 bg-gradient-to-br ${v.gradient}`} />
            <div className="flex flex-1 flex-col justify-between bg-neutral-900 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold ${v.accent}`}>{v.id}</span>
                  <h2 className="text-sm font-medium text-neutral-200">{v.name}</h2>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">{v.description}</p>
              </div>
              <span className="mt-3 text-[10px] font-medium uppercase tracking-widest text-neutral-600 transition-colors group-hover:text-neutral-400">
                Launch &rarr;
              </span>
            </div>
          </Link>
        ))}

        <Link
          href="/settings"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 p-6 text-neutral-600 transition-colors hover:border-neutral-600 hover:text-neutral-400"
        >
          <svg className="mb-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </div>
    </main>
  );
}
