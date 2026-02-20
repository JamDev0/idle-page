"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import { VariantNav } from "@/components/VariantNav";
import type { Task } from "@/types/task";

function IsoTask({ task, todo }: { task: Task; todo: ReturnType<typeof useTodos> }) {
  const idx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group">
      <div className={`flex items-center gap-3 border-l-4 px-4 py-2.5 transition-all ${
        task.checked
          ? "border-teal-300 bg-teal-50/40"
          : "border-transparent hover:border-coral hover:bg-coral/[0.04]"
      }`}>
        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className={`flex h-5 w-5 shrink-0 items-center justify-center transition-all ${
            task.checked
              ? "rotate-45 bg-teal-400 text-white"
              : "border-2 border-slate-300 hover:border-coral"
          } disabled:cursor-not-allowed disabled:opacity-40`}
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        >
          {task.checked && (
            <svg className="-rotate-45 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
              className="flex-1 border-b-2 border-coral/40 bg-transparent px-1 py-0.5 text-sm text-slate-700 outline-none focus:border-coral"
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)} className="text-xs font-bold text-teal-500 hover:text-teal-600">OK</button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-sm font-medium ${task.checked ? "text-slate-400 line-through" : "text-slate-700"}`}>
              {task.text || "(empty)"}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(idx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-xs text-slate-300 hover:text-coral disabled:hidden">&#9650;</button>
              <button onClick={() => todo.moveDown(idx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-xs text-slate-300 hover:text-coral disabled:hidden">&#9660;</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-xs text-slate-300 hover:text-coral disabled:hidden">edit</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-xs text-slate-300 hover:text-red-500 disabled:hidden">del</button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function IsometricVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#f8f6f1]">
      {/* Isometric grid background */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
        <defs>
          <pattern id="iso-grid" width="56" height="32" patternUnits="userSpaceOnUse">
            <path d="M0 32 L28 16 L56 32" fill="none" stroke="#374151" strokeWidth="0.5" />
            <path d="M0 0 L28 16 L56 0" fill="none" stroke="#374151" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#iso-grid)" />
      </svg>

      {/* Geometric accent shapes */}
      <div className="pointer-events-none absolute -right-16 top-20 h-64 w-64 rotate-45 border-[3px] border-teal-200/40" />
      <div className="pointer-events-none absolute -left-8 bottom-32 h-40 w-40 rotate-12 border-[3px] border-coral/20" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-20 w-20 rotate-[30deg] bg-teal-100/30" />

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rotate-45 bg-coral" />
          <span className="text-sm font-bold tracking-wider text-slate-700">IDLE PAGE</span>
        </div>
        <div className="flex items-center gap-4">
          <VariantNav
            current={4}
            className="flex items-center gap-1"
            pillClassName="flex h-7 w-7 items-center justify-center text-[11px] font-bold transition-all"
            activeClassName="rotate-45 bg-coral text-white"
            inactiveClassName="text-slate-400 hover:text-coral"
          />
          <Link href="/settings" className="text-xs font-bold text-slate-400 hover:text-coral">
            Settings
          </Link>
        </div>
      </header>

      {/* Main content: two-column layout */}
      <div className="relative z-10 flex h-full pt-16">
        {/* Media — left 62% */}
        <div className="flex h-full w-[62%] flex-col items-center justify-center p-8">
          <div className="relative">
            {/* Isometric shadow effect */}
            <div className="absolute -bottom-3 left-3 right--3 h-full rounded-lg bg-teal-200/20"
              style={{ transform: "skewX(-2deg)" }} />
            <div className="relative rounded-lg border-2 border-slate-200 bg-white p-2 shadow-sm">
              {media.loading ? (
                <div className="flex h-[60vh] w-[45vw] items-center justify-center">
                  <p className="font-bold text-slate-300">Loading...</p>
                </div>
              ) : (
                <MediaRenderer
                  item={media.currentItem}
                  onNext={media.goNext}
                  imgClassName="max-h-[65vh] max-w-[45vw] rounded object-contain"
                  videoClassName="max-h-[65vh] max-w-[45vw] rounded object-contain"
                  emptyClassName="h-[40vh] w-[40vw] text-slate-400"
                  emptyText="No media"
                  quoteClassName="text-slate-600 font-bold"
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-5 flex items-center gap-3">
            <button onClick={media.goPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-sm text-slate-500 transition-all hover:border-coral hover:text-coral">
              &#9664;
            </button>
            <span className="min-w-[60px] text-center text-xs font-bold text-slate-400">
              {media.items.length > 0 ? `${(media.currentIndex ?? 0) + 1} / ${media.items.length}` : "empty"}
            </span>
            <button onClick={media.goNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-sm text-slate-500 transition-all hover:border-coral hover:text-coral">
              &#9654;
            </button>
          </div>
        </div>

        {/* TODO — right 38%, card panel */}
        <div className="flex h-full w-[38%] flex-col px-4 pb-6 pt-2">
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rotate-45 bg-teal-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Tasks</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">{todo.visibleTasks.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!todo.filePath.trim() ? (
                <div className="p-5">
                  <p className="text-sm text-slate-400">
                    <Link href="/settings" className="font-bold text-coral hover:underline">Configure</Link> your file path.
                  </p>
                </div>
              ) : (
                <>
                  {todo.error && <p className="px-5 pt-3 text-xs font-bold text-red-500">{todo.error}</p>}
                  {todo.isWatcherDegraded && <p className="px-5 pt-3 text-xs text-amber-600">{todo.watcherMessage}</p>}
                  {todo.readOnly && <p className="px-5 pt-3 text-xs font-bold text-amber-600">Read-only</p>}
                  {todo.externalChangeBanner && (
                    <div className="flex items-center gap-2 px-5 pt-3 text-xs text-amber-600">
                      <span className="flex-1">{todo.externalChangeBanner}</span>
                      <button onClick={() => todo.setExternalChangeBanner(null)} className="font-bold underline">ok</button>
                    </div>
                  )}
                  <ul className="py-1">
                    {todo.visibleTasks.map((task) => (
                      <IsoTask key={task.id} task={task} todo={todo} />
                    ))}
                  </ul>
                </>
              )}
            </div>

            {!todo.readOnly && todo.filePath.trim() && (
              <div className="border-t-2 border-slate-100 px-5 py-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={todo.newText}
                    onChange={(e) => todo.setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                    placeholder="New task..."
                    className="flex-1 border-b-2 border-slate-200 bg-transparent px-1 py-1 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300 focus:border-coral"
                  />
                  <button onClick={todo.handleAdd} disabled={!todo.newText.trim() || todo.loading}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-sm font-bold text-white transition-colors hover:bg-coral/80 disabled:opacity-40">
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
