"use client";

import Link from "next/link";

const VARIANT_COUNT = 9;
const VARIANT_IDS = Array.from({ length: VARIANT_COUNT }, (_, i) => i + 1);

interface VariantNavProps {
  current: number;
  className?: string;
  pillClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function VariantNav({
  current,
  className = "",
  pillClassName = "flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-all",
  activeClassName = "bg-white/20 text-white",
  inactiveClassName = "text-white/30 hover:bg-white/[0.06] hover:text-white/60",
}: VariantNavProps) {
  return (
    <nav className={className}>
      {VARIANT_IDS.map((n) => (
        <Link
          key={n}
          href={`/${n}`}
          className={`${pillClassName} ${n === current ? activeClassName : inactiveClassName}`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
