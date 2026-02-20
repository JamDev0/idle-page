"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import type { Task } from "@/types/task";

function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.5,
            animation: `cosmos-twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

function TaskRow({ task, todo }: { task: Task; todo: ReturnType<typeof useTodos> }) {
  const idx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.04]">
      <button
        type="button"
        onClick={() => todo.handleToggle(task)}
        disabled={todo.readOnly}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
          task.checked
            ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-300"
            : "border-slate-500/40 hover:border-indigo-400/50"
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
            className="flex-1 rounded-md border border-indigo-500/30 bg-slate-900/60 px-2 py-1 text-sm text-slate-200 outline-none focus:border-indigo-400/50"
            autoFocus
          />
          <button onClick={() => todo.handleSaveEdit(task.id)} className="text-xs text-indigo-400 hover:text-indigo-300">
            Save
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-sm ${task.checked ? "text-slate-500 line-through" : "text-slate-200"}`}>
            {task.text || "(empty)"}
          </span>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => todo.moveUp(idx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
              className="rounded p-1 text-xs text-slate-500 hover:text-slate-300 disabled:opacity-0">&#9650;</button>
            <button onClick={() => todo.moveDown(idx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
              className="rounded p-1 text-xs text-slate-500 hover:text-slate-300 disabled:opacity-0">&#9660;</button>
            <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
              className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-slate-300 disabled:opacity-0">edit</button>
            <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
              className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-red-400 disabled:opacity-0">del</button>
          </div>
        </>
      )}
    </li>
  );
}

export default function CosmosVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#020014] via-[#0a0025] to-[#050020]">
      <StarField />

      {/* Nebula gradient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-purple-900/15 blur-[150px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-900/10 blur-[100px]" />

      {/* Media — center stage with floating animation */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: "cosmos-float 8s ease-in-out infinite" }}
      >
        {media.loading ? (
          <p className="text-sm text-slate-500">Loading media...</p>
        ) : (
          <MediaRenderer
            item={media.currentItem}
            onNext={media.goNext}
            imgClassName="max-h-[75vh] max-w-[70vw] rounded-2xl object-contain shadow-2xl shadow-indigo-500/10"
            videoClassName="max-h-[75vh] max-w-[70vw] rounded-2xl object-contain shadow-2xl shadow-indigo-500/10"
            emptyClassName="text-slate-600"
            emptyText="No media yet"
          />
        )}
      </div>

      {/* Media controls — bottom center, pill shape */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.06] bg-slate-900/50 px-2 py-1.5 backdrop-blur-xl">
        <button onClick={media.goPrev}
          className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200">
          Prev
        </button>
        <div className="h-4 w-px bg-white/10" />
        <button onClick={media.goNext}
          className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200">
          Next
        </button>
      </div>

      {/* TODO panel — floating card, bottom-left */}
      <aside className="absolute bottom-20 left-6 z-20 w-80 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/[0.06] bg-slate-950/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400/70">Tasks</h2>
          <Link href="/settings" className="text-[10px] text-slate-600 transition-colors hover:text-slate-400">settings</Link>
        </div>

        {!todo.filePath.trim() ? (
          <p className="text-xs text-slate-600">
            <Link href="/settings" className="underline hover:text-slate-400">Configure TODO path</Link> to get started.
          </p>
        ) : (
          <>
            {todo.error && <p className="mb-2 text-xs text-red-400">{todo.error}</p>}
            {todo.isWatcherDegraded && <p className="mb-2 text-xs text-amber-400/80">{todo.watcherMessage}</p>}
            {todo.externalChangeBanner && (
              <div className="mb-2 flex items-center gap-2 text-xs text-amber-400/70">
                <span className="flex-1">{todo.externalChangeBanner}</span>
                <button onClick={() => todo.setExternalChangeBanner(null)} className="text-[10px] underline">dismiss</button>
              </div>
            )}
            {todo.readOnly && <p className="mb-2 text-xs text-amber-400/70">Read-only mode</p>}

            <ul className="-mx-3 space-y-0.5">
              {todo.visibleTasks.map((task) => (
                <TaskRow key={task.id} task={task} todo={todo} />
              ))}
            </ul>

            {!todo.readOnly && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={todo.newText}
                  onChange={(e) => todo.setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                  placeholder="New task..."
                  className="flex-1 rounded-lg border border-white/[0.06] bg-slate-900/40 px-3 py-1.5 text-sm text-slate-300 outline-none placeholder:text-slate-700 focus:border-indigo-500/30"
                />
                <button
                  onClick={todo.handleAdd}
                  disabled={!todo.newText.trim() || todo.loading}
                  className="rounded-lg bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/25 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            )}
          </>
        )}
      </aside>

      {/* Variant nav */}
      <nav className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/[0.04] bg-slate-950/40 px-3 py-1.5 backdrop-blur-lg">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Link
            key={n}
            href={`/${n}`}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-all ${
              n === 1 ? "bg-indigo-500/25 text-indigo-300" : "text-slate-600 hover:bg-white/[0.05] hover:text-slate-400"
            }`}
          >
            {n}
          </Link>
        ))}
      </nav>
    </div>
  );
}
