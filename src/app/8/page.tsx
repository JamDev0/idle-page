"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import { VariantNav } from "@/components/VariantNav";
import type { Task } from "@/types/task";

function VinylTask({ task, todo }: { task: Task; todo: ReturnType<typeof useTodos> }) {
  const idx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group">
      <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        task.checked ? "opacity-45" : "hover:bg-amber-900/10"
      }`}>
        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            task.checked
              ? "border-amber-500 bg-amber-500 text-[#1a1410]"
              : "border-amber-700/30 hover:border-amber-500/60"
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
              className="flex-1 rounded border border-amber-600/30 bg-[#1a1410] px-2 py-1 text-sm text-amber-100 caret-amber-500 outline-none focus:border-amber-500"
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)} className="text-xs text-amber-500 hover:text-amber-400">save</button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-sm ${task.checked ? "text-amber-800/40 line-through" : "text-amber-100/80"}`}>
              {task.text || "(empty)"}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(idx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-[10px] text-amber-800/30 hover:text-amber-500 disabled:hidden">&#9650;</button>
              <button onClick={() => todo.moveDown(idx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-[10px] text-amber-800/30 hover:text-amber-500 disabled:hidden">&#9660;</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-[10px] text-amber-800/30 hover:text-amber-500 disabled:hidden">edit</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-[10px] text-amber-800/30 hover:text-red-400 disabled:hidden">del</button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function VinylVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1410]">
      {/* Warm ambient light */}
      <div className="pointer-events-none absolute left-1/3 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-900/[0.06] blur-[200px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-orange-800/[0.04] blur-[150px]" />

      {/* Subtle wood grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(180,140,80,0.1) 8px, rgba(180,140,80,0.1) 9px)",
        }}
      />

      {/* Layout */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Top bar with warm tones */}
        <header className="flex items-center justify-between border-b border-amber-900/15 px-8 py-4">
          <div className="flex items-center gap-3">
            {/* Vinyl record icon */}
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border-2 border-amber-700/30" />
              <div className="absolute inset-[6px] rounded-full border border-amber-700/20" />
              <div className="absolute inset-[12px] rounded-full bg-amber-600/30" />
            </div>
            <span className="text-sm font-semibold tracking-wider text-amber-400/70">IDLE PAGE</span>
          </div>
          <div className="flex items-center gap-4">
            <VariantNav
              current={8}
              className="flex items-center gap-1 rounded-full border border-amber-800/15 bg-amber-950/20 px-2 py-1"
              pillClassName="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-all"
              activeClassName="bg-amber-500 text-[#1a1410]"
              inactiveClassName="text-amber-800/30 hover:text-amber-500/60"
            />
            <Link href="/settings" className="rounded-full border border-amber-800/15 px-3 py-1.5 text-[10px] font-medium text-amber-700/40 hover:text-amber-500">
              Settings
            </Link>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Media — center stage, album cover style */}
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="relative">
              {/* Album sleeve shadow */}
              <div className="absolute -bottom-2 -right-2 h-full w-full rounded-lg bg-black/20" />
              <div className="relative overflow-hidden rounded-lg shadow-2xl shadow-black/30">
                {media.loading ? (
                  <div className="flex h-[62vh] w-[62vh] items-center justify-center bg-[#201a14]">
                    <p className="text-sm text-amber-800/30">Loading...</p>
                  </div>
                ) : (
                  <MediaRenderer
                    item={media.currentItem}
                    onNext={media.goNext}
                    imgClassName="max-h-[65vh] max-w-[50vw] rounded-lg object-contain"
                    videoClassName="max-h-[65vh] max-w-[50vw] rounded-lg object-contain"
                    emptyClassName="h-[50vh] w-[50vh] bg-[#201a14] text-amber-800/30"
                    emptyText="No tracks loaded"
                    quoteClassName="text-amber-300/70"
                  />
                )}
              </div>
            </div>

            {/* Transport controls */}
            <div className="mt-6 flex items-center gap-5">
              <button onClick={media.goPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-800/20 text-amber-600/50 transition-all hover:border-amber-500/40 hover:text-amber-500">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button onClick={media.goNext}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/90 text-[#1a1410] shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-400">
                <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button onClick={media.goNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-800/20 text-amber-600/50 transition-all hover:border-amber-500/40 hover:text-amber-500">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Track info */}
            <div className="mt-3 text-center">
              <p className="text-xs text-amber-700/30">
                {media.items.length > 0 ? `Track ${(media.currentIndex ?? 0) + 1} of ${media.items.length}` : "No tracks"}
              </p>
            </div>
          </div>

          {/* TODO — right sidebar, playlist style */}
          <aside className="flex w-72 shrink-0 flex-col border-l border-amber-900/15 bg-[#18120e]">
            <div className="flex items-center justify-between border-b border-amber-900/15 px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-500/50">Playlist</h2>
              <Link href="/settings" className="text-[10px] text-amber-800/25 hover:text-amber-600/50">cfg</Link>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-1">
              {!todo.filePath.trim() ? (
                <p className="px-3 pt-3 text-xs text-amber-800/30">
                  <Link href="/settings" className="text-amber-600/50 underline hover:text-amber-500">Set file</Link> to begin.
                </p>
              ) : (
                <>
                  {todo.error && <p className="px-3 pt-2 text-xs text-red-400">{todo.error}</p>}
                  {todo.isWatcherDegraded && <p className="px-3 pt-2 text-xs text-amber-600/60">{todo.watcherMessage}</p>}
                  {todo.readOnly && <p className="px-3 pt-2 text-xs text-amber-600/60">Read-only</p>}
                  {todo.externalChangeBanner && (
                    <div className="flex items-center gap-2 px-3 pt-2 text-xs text-amber-600/50">
                      <span className="flex-1">{todo.externalChangeBanner}</span>
                      <button onClick={() => todo.setExternalChangeBanner(null)} className="underline">ok</button>
                    </div>
                  )}
                  <ul className="space-y-0">
                    {todo.visibleTasks.map((task) => (
                      <VinylTask key={task.id} task={task} todo={todo} />
                    ))}
                  </ul>
                </>
              )}
            </div>

            {!todo.readOnly && todo.filePath.trim() && (
              <div className="border-t border-amber-900/15 px-4 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={todo.newText}
                    onChange={(e) => todo.setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                    placeholder="Add track..."
                    className="flex-1 rounded-lg border border-amber-900/15 bg-[#1a1410] px-3 py-1.5 text-sm text-amber-200/70 outline-none placeholder:text-amber-900/20 focus:border-amber-600/30"
                  />
                  <button onClick={todo.handleAdd} disabled={!todo.newText.trim() || todo.loading}
                    className="rounded-lg bg-amber-500/80 px-3 py-1.5 text-xs font-medium text-[#1a1410] hover:bg-amber-400 disabled:opacity-30">
                    +
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
