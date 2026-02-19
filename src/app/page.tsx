import { TodoPanel } from "@/components/TodoPanel";

/**
 * Idle view composition (spec §6.2).
 * Media-first layout with subdued TODO panel.
 */
export default function IdlePage() {
  return (
    <main className="grid min-h-screen grid-rows-[1fr_auto]">
      {/* Media area — dominant visual layer (spec §12.1) */}
      <section
        className="flex items-center justify-center bg-[#0f0f0f]"
        aria-label="Media display"
      >
        <div className="text-center text-[var(--muted)]">
          <p className="text-lg">Media placeholder</p>
          <p className="mt-2 text-sm">Next / Prev controls will go here</p>
        </div>
      </section>

      {/* TODO panel — present but subdued (spec §12.1), full CRUD (spec §5.3) */}
      <TodoPanel />
    </main>
  );
}
