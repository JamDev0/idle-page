"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import { VariantNav } from "@/components/VariantNav";
import type { Task } from "@/types/task";

function TopoTask({ task, todo }: { task: Task; todo: ReturnType<typeof useTodos> }) {
  const idx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group">
      <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        task.checked ? "opacity-45" : "hover:bg-[#4a6050]/10"
      }`}>
        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-all ${
            task.checked
              ? "border-[#7a9a6a] bg-[#7a9a6a]/20 text-[#8ab87a]"
              : "border-[#8a7a6a]/30 hover:border-[#7a9a6a]/50"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {task.checked && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={todo.editText}
              onChange={(e) => todo.setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") todo.handleSaveEdit(task.id);
                if (e.key === "Escape") { todo.setEditingId(null); todo.setEditText(""); }
              }}
              className="flex-1 border-b border-[#7a9a6a]/30 bg-transparent px-1 py-0.5 text-sm text-[#3a3a2e] outline-none focus:border-[#7a9a6a]"
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)} className="text-[10px] text-[#7a9a6a] hover:text-[#5a8a4a]">save</button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-sm ${task.checked ? "text-[#a09a8a]/40 line-through" : "text-[#3a3a2e]"}`}>
              {task.text || "(empty)"}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(idx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-[10px] text-[#a09a8a]/30 hover:text-[#7a9a6a] disabled:hidden">&#9650;</button>
              <button onClick={() => todo.moveDown(idx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-[10px] text-[#a09a8a]/30 hover:text-[#7a9a6a] disabled:hidden">&#9660;</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-[10px] text-[#a09a8a]/30 hover:text-[#7a9a6a] disabled:hidden">edit</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-[10px] text-[#a09a8a]/30 hover:text-[#9a5a5a] disabled:hidden">del</button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function TopographicVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#e8e0d0]">
      {/* Topographic contour lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
        <defs>
          <pattern id="topo" width="200" height="200" patternUnits="userSpaceOnUse">
            <ellipse cx="100" cy="100" rx="90" ry="60" fill="none" stroke="#6a5a4a" strokeWidth="0.6" />
            <ellipse cx="100" cy="100" rx="70" ry="45" fill="none" stroke="#6a5a4a" strokeWidth="0.6" />
            <ellipse cx="100" cy="100" rx="50" ry="30" fill="none" stroke="#6a5a4a" strokeWidth="0.6" />
            <ellipse cx="100" cy="100" rx="30" ry="18" fill="none" stroke="#6a5a4a" strokeWidth="0.6" />
            <ellipse cx="100" cy="100" rx="12" ry="8" fill="none" stroke="#6a5a4a" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo)" />
      </svg>

      {/* Terrain color blobs */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-[500px] w-[500px] rounded-full bg-[#b8c8a8]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#c8a888]/10 blur-[100px]" />

      {/* Layout: horizontal with map-style annotations */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-[#c0b8a0]/40 px-8 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-semibold tracking-wider text-[#5a5a48]">IDLE PAGE</span>
            <span className="text-[10px] text-[#a09a8a]">TOPOGRAPHIC</span>
          </div>
          <div className="flex items-center gap-4">
            <VariantNav
              current={9}
              className="flex items-center gap-1 rounded-full border border-[#c0b8a0]/30 bg-[#e0d8c8]/60 px-2 py-1"
              pillClassName="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-all"
              activeClassName="bg-[#7a9a6a] text-white"
              inactiveClassName="text-[#a09a8a]/50 hover:text-[#6a7a5a]"
            />
            <Link href="/settings" className="rounded-full border border-[#c0b8a0]/30 bg-[#e0d8c8]/40 px-3 py-1.5 text-[10px] font-medium text-[#8a8070] hover:text-[#5a5a48]">
              Settings
            </Link>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Media */}
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="relative">
              {/* Elevation markers */}
              <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2">
                <div className="flex flex-col items-end gap-8">
                  {[300, 200, 100].map((elev) => (
                    <div key={elev} className="flex items-center gap-1">
                      <span className="text-[8px] text-[#a09a8a]/30">{elev}m</span>
                      <div className="h-px w-3 bg-[#a09a8a]/20" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#c0b8a0]/30 bg-white/40 p-2 shadow-sm">
                {media.loading ? (
                  <div className="flex h-[60vh] w-[50vw] items-center justify-center">
                    <p className="text-sm text-[#a09a8a]">Mapping...</p>
                  </div>
                ) : (
                  <MediaRenderer
                    item={media.currentItem}
                    onNext={media.goNext}
                    imgClassName="max-h-[65vh] max-w-[52vw] rounded object-contain"
                    videoClassName="max-h-[65vh] max-w-[52vw] rounded object-contain"
                    emptyClassName="h-[45vh] w-[45vw] text-[#a09a8a]"
                    emptyText="No terrain data"
                    quoteClassName="text-[#5a6a4a]"
                  />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-5 flex items-center gap-4">
              <button onClick={media.goPrev}
                className="rounded-full border border-[#c0b8a0]/30 bg-white/40 px-5 py-2 text-xs text-[#8a8070] transition-colors hover:bg-white/60 hover:text-[#5a5a48]">
                &#9664; prev
              </button>
              <span className="rounded-full bg-[#7a9a6a]/10 px-3 py-1 text-[10px] font-medium text-[#7a9a6a]">
                {media.items.length > 0 ? `${(media.currentIndex ?? 0) + 1} / ${media.items.length}` : "0"}
              </span>
              <button onClick={media.goNext}
                className="rounded-full border border-[#c0b8a0]/30 bg-white/40 px-5 py-2 text-xs text-[#8a8070] transition-colors hover:bg-white/60 hover:text-[#5a5a48]">
                next &#9654;
              </button>
            </div>
          </div>

          {/* TODO — right side, field notes */}
          <aside className="flex w-72 shrink-0 flex-col border-l border-[#c0b8a0]/40 bg-[#e4dcc8]/50">
            <div className="border-b border-[#c0b8a0]/40 px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7a9a6a]">Field Notes</h2>
              <p className="mt-0.5 text-[9px] text-[#a09a8a]">{todo.visibleTasks.length} waypoints</p>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-1">
              {!todo.filePath.trim() ? (
                <p className="px-3 pt-3 text-xs text-[#a09a8a]">
                  <Link href="/settings" className="text-[#7a9a6a] underline hover:text-[#5a8a4a]">Set coordinates</Link> to begin.
                </p>
              ) : (
                <>
                  {todo.error && <p className="px-3 pt-2 text-xs text-[#9a5a5a]">{todo.error}</p>}
                  {todo.isWatcherDegraded && <p className="px-3 pt-2 text-xs text-[#9a8a5a]">{todo.watcherMessage}</p>}
                  {todo.readOnly && <p className="px-3 pt-2 text-xs text-[#9a8a5a]">Read-only</p>}
                  {todo.externalChangeBanner && (
                    <div className="flex items-center gap-2 px-3 pt-2 text-xs text-[#9a8a5a]">
                      <span className="flex-1">{todo.externalChangeBanner}</span>
                      <button onClick={() => todo.setExternalChangeBanner(null)} className="underline">ok</button>
                    </div>
                  )}
                  <ul className="space-y-0">
                    {todo.visibleTasks.map((task) => (
                      <TopoTask key={task.id} task={task} todo={todo} />
                    ))}
                  </ul>
                </>
              )}
            </div>

            {!todo.readOnly && todo.filePath.trim() && (
              <div className="border-t border-[#c0b8a0]/40 px-4 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={todo.newText}
                    onChange={(e) => todo.setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                    placeholder="New waypoint..."
                    className="flex-1 rounded-lg border border-[#c0b8a0]/30 bg-white/40 px-3 py-1.5 text-sm text-[#3a3a2e] outline-none placeholder:text-[#b8b0a0]/50 focus:border-[#7a9a6a]/50"
                  />
                  <button onClick={todo.handleAdd} disabled={!todo.newText.trim() || todo.loading}
                    className="rounded-lg bg-[#7a9a6a] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#6a8a5a] disabled:opacity-30">
                    +
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Footer coordinates */}
        <div className="flex items-center justify-center border-t border-[#c0b8a0]/40 py-2">
          <span className="text-[9px] tracking-widest text-[#a09a8a]/40">
            LAT 0.000 / LON 0.000 / ELEV 0m
          </span>
        </div>
      </div>
    </div>
  );
}
