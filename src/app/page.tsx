import { MediaArea } from "@/components/MediaArea";
import { TodoPanel } from "@/components/TodoPanel";

/**
 * Idle view composition (spec §6.2).
 * Media-first layout with subdued TODO panel.
 */
export default function IdlePage() {
  return (
    <main className="grid min-h-screen grid-rows-[1fr_auto]">
      {/* Media area — dominant visual layer (spec §12.1), Next/Prev only (spec §12.2) */}
      <MediaArea />

      {/* TODO panel — present but subdued (spec §12.1), full CRUD (spec §5.3) */}
      <TodoPanel />
    </main>
  );
}
