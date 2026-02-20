"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import { VariantNav } from "@/components/VariantNav";
import type { Task } from "@/types/task";

function ZenTask({ task, todo }: { task: Task; todo: ReturnType<typeof useTodos> }) {
  const idx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group">
      <div className="flex items-center gap-4 py-3">
        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-all ${
            task.checked ? "bg-[#7c8c6e]" : "border border-[#c8c0b0] hover:border-[#8a9a7a]"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        />

        {isEditing ? (
          <div className="flex flex-1 items-center gap-3">
            <input
              type="text"
              value={todo.editText}
              onChange={(e) => todo.setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") todo.handleSaveEdit(task.id);
                if (e.key === "Escape") { todo.setEditingId(null); todo.setEditText(""); }
              }}
              className="flex-1 border-b border-[#c8c0b0] bg-transparent px-0 py-0.5 text-sm text-[#4a4a42] outline-none focus:border-[#7c8c6e]"
              style={{ fontFamily: "'Georgia', serif" }}
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)}
              className="text-[10px] tracking-wider text-[#8a9a7a] hover:text-[#5a6a4e]">save</button>
          </div>
        ) : (
          <>
            <span
              className={`flex-1 text-sm leading-relaxed ${task.checked ? "text-[#b8b0a0] line-through" : "text-[#4a4a42]"}`}
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {task.text || "\u2014"}
            </span>
            <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(idx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-[10px] text-[#c8c0b0] hover:text-[#7c8c6e] disabled:hidden">&#9650;</button>
              <button onClick={() => todo.moveDown(idx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-[10px] text-[#c8c0b0] hover:text-[#7c8c6e] disabled:hidden">&#9660;</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-[10px] text-[#c8c0b0] hover:text-[#7c8c6e] disabled:hidden">edit</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-[10px] text-[#c8c0b0] hover:text-[#9e5a5a] disabled:hidden">remove</button>
            </div>
          </>
        )}
      </div>
      <div className="h-px bg-[#e0d8c8]/60" />
    </li>
  );
}

export default function ZenGardenVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#eee8dc]">
      {/* Sand rake pattern */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]">
        <defs>
          <pattern id="zen-lines" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#6b6358" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zen-lines)" />
      </svg>

      {/* Full layout: three vertical sections */}
      <div className="relative z-10 flex h-full">
        {/* Left negative space column */}
        <div className="hidden w-16 shrink-0 border-r border-[#d8d0c0]/50 lg:block" />

        {/* Center: media */}
        <div className="flex flex-1 flex-col">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-[#d8d0c0]/50 px-8 py-4">
            <span className="text-xs tracking-[0.4em] text-[#a09888]" style={{ fontFamily: "'Georgia', serif" }}>
              idle page
            </span>
            <div className="flex items-center gap-4">
              <VariantNav
                current={5}
                className="flex items-center gap-1"
                pillClassName="flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-all"
                activeClassName="bg-[#7c8c6e]/20 text-[#5a6a4e]"
                inactiveClassName="text-[#c8c0b0] hover:text-[#8a8070]"
              />
              <Link href="/settings" className="text-[10px] tracking-widest text-[#b8b0a0] hover:text-[#7c8c6e]">settings</Link>
            </div>
          </header>

          {/* Media area — generous whitespace */}
          <div className="flex flex-1 items-center justify-center px-16 py-12">
            {media.loading ? (
              <p className="text-sm text-[#c8c0b0]" style={{ fontFamily: "'Georgia', serif" }}>...</p>
            ) : (
              <MediaRenderer
                item={media.currentItem}
                onNext={media.goNext}
                imgClassName="max-h-[68vh] max-w-[55vw] object-contain"
                videoClassName="max-h-[68vh] max-w-[55vw] object-contain"
                emptyClassName="text-[#c8c0b0]"
                emptyText="empty"
                quoteClassName="text-[#6a6a5e]"
              />
            )}
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-center border-t border-[#d8d0c0]/50 py-3">
            <div className="flex items-center gap-6">
              <button onClick={media.goPrev}
                className="text-xs tracking-widest text-[#b8b0a0] transition-colors hover:text-[#7c8c6e]"
                style={{ fontFamily: "'Georgia', serif" }}>
                previous
              </button>
              <span className="h-1 w-1 rounded-full bg-[#d8d0c0]" />
              <span className="text-[10px] text-[#d0c8b8]">
                {media.items.length > 0 ? `${(media.currentIndex ?? 0) + 1} of ${media.items.length}` : ""}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#d8d0c0]" />
              <button onClick={media.goNext}
                className="text-xs tracking-widest text-[#b8b0a0] transition-colors hover:text-[#7c8c6e]"
                style={{ fontFamily: "'Georgia', serif" }}>
                next
              </button>
            </div>
          </div>
        </div>

        {/* Right: TODO panel */}
        <aside className="flex h-full w-72 shrink-0 flex-col border-l border-[#d8d0c0]/50 bg-[#eee8dc]">
          <div className="px-6 py-5">
            <h2 className="text-[10px] font-normal uppercase tracking-[0.35em] text-[#a09888]"
              style={{ fontFamily: "'Georgia', serif" }}>
              tasks
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {!todo.filePath.trim() ? (
              <p className="text-xs text-[#b8b0a0]" style={{ fontFamily: "'Georgia', serif" }}>
                <Link href="/settings" className="text-[#7c8c6e] underline hover:text-[#5a6a4e]">
                  Set path
                </Link>{" "}
                to begin.
              </p>
            ) : (
              <>
                {todo.error && <p className="mb-3 text-xs text-[#9e5a5a]">{todo.error}</p>}
                {todo.isWatcherDegraded && <p className="mb-3 text-xs text-[#9e8a5a]">{todo.watcherMessage}</p>}
                {todo.readOnly && <p className="mb-3 text-xs text-[#9e8a5a]">Read-only</p>}
                {todo.externalChangeBanner && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-[#9e8a5a]">
                    <span className="flex-1">{todo.externalChangeBanner}</span>
                    <button onClick={() => todo.setExternalChangeBanner(null)} className="underline">ok</button>
                  </div>
                )}
                <ul>
                  {todo.visibleTasks.map((task) => (
                    <ZenTask key={task.id} task={task} todo={todo} />
                  ))}
                </ul>
              </>
            )}
          </div>

          {!todo.readOnly && todo.filePath.trim() && (
            <div className="border-t border-[#d8d0c0]/50 px-6 py-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={todo.newText}
                  onChange={(e) => todo.setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                  placeholder="New..."
                  className="flex-1 border-b border-[#d8d0c0] bg-transparent py-1 text-sm text-[#4a4a42] outline-none placeholder:text-[#d0c8b8] focus:border-[#7c8c6e]"
                  style={{ fontFamily: "'Georgia', serif" }}
                />
                <button onClick={todo.handleAdd} disabled={!todo.newText.trim() || todo.loading}
                  className="text-xs text-[#7c8c6e] hover:text-[#5a6a4e] disabled:opacity-30">add</button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
