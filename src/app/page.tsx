import { MediaArea } from "@/components/MediaArea";
import { TodoPanel } from "@/components/TodoPanel";

/**
 * Idle view composition (spec §6.2).
 * Media full viewport; TODO panel and controls floating per design variant (§13.2).
 */
export default function IdlePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Media area — full viewport, dominant visual layer (spec §12.1) */}
      <MediaArea />

      {/* TODO panel — floating bottom-left (void) or bottom-right (glass), subdued (§12.1) */}
      <TodoPanel />

      {/* Control bar is inside MediaArea, positioned bottom-center */}
    </main>
  );
}
