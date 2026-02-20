"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import { VariantNav } from "@/components/VariantNav";
import type { Task } from "@/types/task";

function PolaroidTask({ task, todo }: { task: Task; todo: ReturnType<typeof useTodos> }) {
  const idx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group">
      <div className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
        task.checked ? "opacity-50" : "hover:bg-amber-50/60"
      }`}>
        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            task.checked
              ? "border-amber-400 bg-amber-400 text-white"
              : "border-amber-300/60 hover:border-amber-400"
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
              className="flex-1 rounded border border-amber-200 bg-white px-2 py-1 text-sm text-amber-900 outline-none focus:border-amber-400"
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)} className="text-xs font-medium text-amber-600 hover:text-amber-800">save</button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-sm ${task.checked ? "text-amber-800/40 line-through" : "text-amber-900/80"}`}
              style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
              {task.text || "(empty)"}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(idx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-[10px] text-amber-300 hover:text-amber-600 disabled:hidden">&#9650;</button>
              <button onClick={() => todo.moveDown(idx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-[10px] text-amber-300 hover:text-amber-600 disabled:hidden">&#9660;</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-[10px] text-amber-300 hover:text-amber-600 disabled:hidden">edit</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-[10px] text-amber-300 hover:text-red-500 disabled:hidden">del</button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function PolaroidVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#f4ede4]">
      {/* Warm light wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-orange-100/10" />

      {/* Scattered mini polaroids in background (decorative) */}
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-16 w-14 rotate-[-8deg] rounded-sm bg-white shadow-md" />
      <div className="pointer-events-none absolute right-[12%] top-[8%] h-14 w-12 rotate-[5deg] rounded-sm bg-white shadow-md" />
      <div className="pointer-events-none absolute bottom-[15%] left-[5%] h-12 w-10 rotate-[12deg] rounded-sm bg-white shadow-md" />

      {/* Top nav */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-8 py-5">
        <h1 className="text-lg tracking-wide text-amber-900/60" style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
          idle page
        </h1>
        <div className="flex items-center gap-4">
          <VariantNav
            current={6}
            className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 shadow-sm backdrop-blur-sm"
            pillClassName="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-all"
            activeClassName="bg-amber-400 text-white shadow-sm"
            inactiveClassName="text-amber-800/30 hover:text-amber-700/60"
          />
          <Link href="/settings" className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-amber-800/50 shadow-sm hover:text-amber-800">
            settings
          </Link>
        </div>
      </header>

      {/* Center: polaroid-framed media */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 pb-20">
        <div
          className="relative rounded-sm bg-white p-4 pb-16 shadow-xl"
          style={{
            transform: "rotate(-1.5deg)",
            boxShadow: "0 8px 30px rgba(120,90,50,0.12), 0 2px 8px rgba(120,90,50,0.08)",
          }}
        >
          {media.loading ? (
            <div className="flex h-[55vh] w-[40vw] items-center justify-center bg-[#f0ebe3]">
              <p className="text-sm text-amber-800/30" style={{ fontFamily: "'Palatino Linotype', serif" }}>developing...</p>
            </div>
          ) : (
            <MediaRenderer
              item={media.currentItem}
              onNext={media.goNext}
              className="bg-[#f0ebe3]"
              imgClassName="max-h-[55vh] max-w-[42vw] object-contain"
              videoClassName="max-h-[55vh] max-w-[42vw] object-contain"
              emptyClassName="h-[40vh] w-[35vw] text-amber-800/30 bg-[#f0ebe3]"
              emptyText="no photos yet"
              quoteClassName="text-amber-900/60"
            />
          )}
          {/* Caption area on the bottom white strip */}
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-center text-xs text-amber-800/30" style={{ fontFamily: "'Palatino Linotype', serif" }}>
              {media.currentItem?.title ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* Media controls */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <button onClick={media.goPrev}
          className="rounded-full bg-white/80 px-5 py-2 text-xs text-amber-800/50 shadow-sm transition-colors hover:bg-white hover:text-amber-800"
          style={{ fontFamily: "'Palatino Linotype', serif" }}>
          &#9664; prev
        </button>
        <span className="text-[10px] text-amber-800/20">
          {media.items.length > 0 ? `${(media.currentIndex ?? 0) + 1} / ${media.items.length}` : ""}
        </span>
        <button onClick={media.goNext}
          className="rounded-full bg-white/80 px-5 py-2 text-xs text-amber-800/50 shadow-sm transition-colors hover:bg-white hover:text-amber-800"
          style={{ fontFamily: "'Palatino Linotype', serif" }}>
          next &#9654;
        </button>
      </div>

      {/* TODO — bottom left, note card feel */}
      <aside
        className="absolute bottom-16 left-6 z-20 w-72 max-h-[55vh] overflow-y-auto rounded-lg bg-white/90 p-5 shadow-lg backdrop-blur-sm"
        style={{ transform: "rotate(0.5deg)" }}
      >
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-amber-700/50">Notes</h2>

        {!todo.filePath.trim() ? (
          <p className="text-xs text-amber-800/40" style={{ fontFamily: "'Palatino Linotype', serif" }}>
            <Link href="/settings" className="text-amber-600 underline hover:text-amber-800">Set file path</Link> to begin.
          </p>
        ) : (
          <>
            {todo.error && <p className="mb-2 text-xs text-red-500">{todo.error}</p>}
            {todo.isWatcherDegraded && <p className="mb-2 text-xs text-amber-600">{todo.watcherMessage}</p>}
            {todo.readOnly && <p className="mb-2 text-xs text-amber-600">Read-only</p>}
            {todo.externalChangeBanner && (
              <div className="mb-2 flex items-center gap-2 text-xs text-amber-600">
                <span className="flex-1">{todo.externalChangeBanner}</span>
                <button onClick={() => todo.setExternalChangeBanner(null)} className="underline">ok</button>
              </div>
            )}

            <ul className="-mx-3 space-y-0">
              {todo.visibleTasks.map((task) => (
                <PolaroidTask key={task.id} task={task} todo={todo} />
              ))}
            </ul>

            {!todo.readOnly && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={todo.newText}
                  onChange={(e) => todo.setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                  placeholder="Write a note..."
                  className="flex-1 rounded-lg border border-amber-200/60 bg-amber-50/30 px-3 py-1.5 text-sm text-amber-900 outline-none placeholder:text-amber-400/40 focus:border-amber-400"
                  style={{ fontFamily: "'Palatino Linotype', serif" }}
                />
                <button onClick={todo.handleAdd} disabled={!todo.newText.trim() || todo.loading}
                  className="rounded-lg bg-amber-400/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-40">
                  Add
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
