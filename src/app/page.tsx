"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import type { Task } from "@/types/task";

function FilmGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay opacity-[0.06]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function TaskItem({ task, todo }: { task: Task; todo: ReturnType<typeof useTodos> }) {
  const idx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group border-b border-red-950/40 last:border-b-0">
      <div className="flex items-center gap-3 px-1 py-2">
        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
            task.checked
              ? "border-red-700/80 bg-red-800/40 text-red-300"
              : "border-red-900/50 hover:border-red-700/60"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {task.checked && <span className="text-[10px] leading-none">&#10003;</span>}
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
              className="flex-1 border-b border-red-800/40 bg-transparent px-1 py-0.5 text-sm text-red-200/80 caret-red-500 outline-none"
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)} className="text-[10px] text-red-600 hover:text-red-400">save</button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-sm ${task.checked ? "text-red-900/60 line-through" : "text-red-200/70"}`}>
              {task.text || "(empty)"}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(idx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-[10px] text-red-900/50 hover:text-red-400 disabled:hidden">&#9650;</button>
              <button onClick={() => todo.moveDown(idx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-[10px] text-red-900/50 hover:text-red-400 disabled:hidden">&#9660;</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-[10px] text-red-900/50 hover:text-red-400 disabled:hidden">edit</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-[10px] text-red-900/50 hover:text-red-300 disabled:hidden">del</button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function HomePage() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#241414]">
      <FilmGrain />

      <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-red-700/[0.25] blur-[180px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[400px] w-[400px] rounded-full bg-red-600/[0.18] blur-[150px]" />

      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(28,14,14,0.25) 100%)" }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {media.loading ? (
          <p className="text-sm text-red-900/50">Loading...</p>
        ) : (
          <div className="relative">
            <div className="absolute -inset-4 rounded-sm border border-red-900/10" />
            <MediaRenderer
              item={media.currentItem}
              onNext={media.goNext}
              imgClassName="max-h-[72vh] max-w-[60vw] object-contain brightness-[0.92] contrast-[1.05]"
              videoClassName="max-h-[72vh] max-w-[60vw] object-contain brightness-[0.92] contrast-[1.05]"
              emptyClassName="text-red-900/40"
              emptyText="No media loaded"
              quoteClassName="text-red-300/60"
            />
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded border border-red-900/20 bg-[#241414]/70 px-5 py-2 backdrop-blur-sm">
        <button onClick={media.goPrev} className="text-xs text-red-800/60 transition-colors hover:text-red-400">
          &#9664; prev
        </button>
        <span className="text-[10px] text-red-950/40">
          {media.items.length > 0 ? `${(media.currentIndex ?? 0) + 1} / ${media.items.length}` : ""}
        </span>
        <button onClick={media.goNext} className="text-xs text-red-800/60 transition-colors hover:text-red-400">
          next &#9654;
        </button>
      </div>

      <aside className="absolute bottom-14 right-5 top-14 z-30 flex w-64 flex-col rounded border border-red-900/15 bg-[#241414]/80 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-red-950/30 px-4 py-3">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-red-700/50">Checklist</h2>
          <Link href="/settings" className="text-[10px] text-red-900/40 hover:text-red-600">settings</Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {!todo.filePath.trim() ? (
            <p className="mt-2 text-xs text-red-900/40">
              <Link href="/settings" className="text-red-700/50 underline hover:text-red-500">Set file path</Link>
            </p>
          ) : (
            <>
              {todo.error && <p className="mb-2 text-xs text-red-500/80">{todo.error}</p>}
              {todo.isWatcherDegraded && <p className="mb-2 text-xs text-amber-700/60">{todo.watcherMessage}</p>}
              {todo.readOnly && <p className="mb-2 text-xs text-amber-700/60">Read-only</p>}
              {todo.externalChangeBanner && (
                <div className="mb-2 flex items-center gap-2 text-xs text-amber-700/50">
                  <span className="flex-1">{todo.externalChangeBanner}</span>
                  <button onClick={() => todo.setExternalChangeBanner(null)} className="underline">ok</button>
                </div>
              )}
              <ul>
                {todo.visibleTasks.map((task) => (
                  <TaskItem key={task.id} task={task} todo={todo} />
                ))}
              </ul>
            </>
          )}
        </div>

        {!todo.readOnly && todo.filePath.trim() && (
          <div className="border-t border-red-950/30 px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={todo.newText}
                onChange={(e) => todo.setNewText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                placeholder="New item..."
                className="flex-1 border-b border-red-900/20 bg-transparent px-1 py-1 text-xs text-red-300/60 outline-none placeholder:text-red-950/30 focus:border-red-700/40"
              />
              <button onClick={todo.handleAdd} disabled={!todo.newText.trim() || todo.loading}
                className="text-[10px] text-red-700/40 hover:text-red-400 disabled:opacity-30">add</button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
