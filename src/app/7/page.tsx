"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import { VariantNav } from "@/components/VariantNav";
import type { Task } from "@/types/task";

function BlueprintTask({ task, todo, index }: { task: Task; todo: ReturnType<typeof useTodos>; index: number }) {
  const fullIdx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group font-mono">
      <div className="flex items-center gap-2 py-1.5">
        <span className="w-5 shrink-0 text-right text-[10px] text-[#5a8ab8]/40">
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
            task.checked
              ? "border-[#7ab0e0] bg-[#7ab0e0]/20 text-[#a0d0ff]"
              : "border-[#3a6a9a]/40 hover:border-[#7ab0e0]"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {task.checked && <span className="text-[8px]">&#10003;</span>}
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
              className="flex-1 border-b border-[#7ab0e0]/40 bg-transparent px-1 py-0.5 font-mono text-xs text-[#c0d8f0] outline-none"
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)} className="text-[10px] text-[#7ab0e0] hover:text-[#a0d0ff]">OK</button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-xs ${task.checked ? "text-[#3a6a9a]/40 line-through" : "text-[#a0c8e8]"}`}>
              {task.text || "---"}
            </span>
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(fullIdx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-[10px] text-[#3a6a9a]/40 hover:text-[#7ab0e0] disabled:hidden">UP</button>
              <button onClick={() => todo.moveDown(fullIdx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-[10px] text-[#3a6a9a]/40 hover:text-[#7ab0e0] disabled:hidden">DN</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-[10px] text-[#3a6a9a]/40 hover:text-[#7ab0e0] disabled:hidden">ED</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-[10px] text-[#3a6a9a]/40 hover:text-[#e07070] disabled:hidden">RM</button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function BlueprintVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a2a40]">
      {/* Blueprint grid */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <pattern id="bp-small" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a4a6a" strokeWidth="0.3" />
          </pattern>
          <pattern id="bp-large" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#bp-small)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#2a4a6a" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-large)" />
      </svg>

      {/* Technical annotation marks */}
      <div className="pointer-events-none absolute left-6 top-6 z-20 font-mono text-[10px] text-[#3a6a9a]/30">
        <span>REV 0.1.0 | SCALE 1:1</span>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 z-20 font-mono text-[10px] text-[#3a6a9a]/30">
        <span>SHEET 1 OF 1</span>
      </div>

      {/* Split layout */}
      <div className="relative z-10 flex h-full">
        {/* Media — left, with schematic frame */}
        <div className="flex h-full flex-1 flex-col">
          {/* Title strip */}
          <div className="flex items-center justify-between border-b border-[#2a4a6a]/60 px-6 py-2.5">
            <span className="font-mono text-xs tracking-wider text-[#5a8ab8]/60">MEDIA VIEWPORT</span>
            <div className="flex items-center gap-3">
              <VariantNav
                current={7}
                className="flex items-center gap-0.5"
                pillClassName="flex h-5 w-5 items-center justify-center font-mono text-[10px] transition-all"
                activeClassName="border border-[#7ab0e0] text-[#7ab0e0]"
                inactiveClassName="text-[#3a6a9a]/30 hover:text-[#5a8ab8]"
              />
              <Link href="/settings" className="font-mono text-[10px] text-[#3a6a9a]/40 hover:text-[#7ab0e0]">CONFIG</Link>
            </div>
          </div>

          {/* Media display */}
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="relative">
              {/* Dimension annotation lines */}
              <div className="pointer-events-none absolute -left-8 -top-8 h-4 w-4 border-l border-t border-[#5a8ab8]/20" />
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-4 w-4 border-b border-r border-[#5a8ab8]/20" />
              <div className="pointer-events-none absolute -right-8 -top-8 h-4 w-4 border-r border-t border-[#5a8ab8]/20" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-4 w-4 border-b border-l border-[#5a8ab8]/20" />

              {media.loading ? (
                <div className="flex h-[60vh] w-[50vw] items-center justify-center border border-dashed border-[#3a6a9a]/30">
                  <p className="font-mono text-xs text-[#3a6a9a]/40">LOADING...</p>
                </div>
              ) : (
                <div className="border border-[#3a6a9a]/20 p-1">
                  <MediaRenderer
                    item={media.currentItem}
                    onNext={media.goNext}
                    imgClassName="max-h-[70vh] max-w-[52vw] object-contain"
                    videoClassName="max-h-[70vh] max-w-[52vw] object-contain"
                    emptyClassName="h-[50vh] w-[45vw] text-[#3a6a9a]/30 border border-dashed border-[#3a6a9a]/20"
                    emptyText="NO MEDIA LOADED"
                    quoteClassName="text-[#7ab0e0] font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center border-t border-[#2a4a6a]/60 py-2.5">
            <div className="flex items-center gap-4 font-mono text-xs">
              <button onClick={media.goPrev} className="text-[#5a8ab8]/50 hover:text-[#7ab0e0]">&lt;-- PREV</button>
              <span className="text-[#3a6a9a]/30">|</span>
              <span className="text-[10px] text-[#3a6a9a]/30">
                {media.items.length > 0 ? `ITEM ${(media.currentIndex ?? 0) + 1} OF ${media.items.length}` : "EMPTY"}
              </span>
              <span className="text-[#3a6a9a]/30">|</span>
              <button onClick={media.goNext} className="text-[#5a8ab8]/50 hover:text-[#7ab0e0]">NEXT --&gt;</button>
            </div>
          </div>
        </div>

        {/* TODO — right side, schematic panel */}
        <aside className="flex h-full w-72 shrink-0 flex-col border-l border-[#2a4a6a]/60">
          <div className="flex items-center justify-between border-b border-[#2a4a6a]/60 px-4 py-2.5">
            <span className="font-mono text-xs tracking-wider text-[#5a8ab8]/60">TASK LIST</span>
            <span className="font-mono text-[10px] text-[#3a6a9a]/30">{todo.visibleTasks.length} ITEMS</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            {!todo.filePath.trim() ? (
              <p className="mt-2 font-mono text-xs text-[#3a6a9a]/40">
                NO FILE. <Link href="/settings" className="text-[#7ab0e0]/60 underline hover:text-[#7ab0e0]">CONFIG</Link>
              </p>
            ) : (
              <>
                {todo.error && <p className="mb-2 font-mono text-xs text-[#e07070]">{todo.error}</p>}
                {todo.isWatcherDegraded && <p className="mb-2 font-mono text-xs text-[#e0c070]">{todo.watcherMessage}</p>}
                {todo.readOnly && <p className="mb-2 font-mono text-xs text-[#e0c070]">READ-ONLY</p>}
                {todo.externalChangeBanner && (
                  <div className="mb-2 flex items-center gap-2 font-mono text-xs text-[#e0c070]">
                    <span className="flex-1">{todo.externalChangeBanner}</span>
                    <button onClick={() => todo.setExternalChangeBanner(null)} className="underline">OK</button>
                  </div>
                )}
                <ul>
                  {todo.visibleTasks.map((task, i) => (
                    <BlueprintTask key={task.id} task={task} todo={todo} index={i} />
                  ))}
                </ul>
              </>
            )}
          </div>

          {!todo.readOnly && todo.filePath.trim() && (
            <div className="border-t border-[#2a4a6a]/60 px-4 py-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={todo.newText}
                  onChange={(e) => todo.setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                  placeholder="NEW ITEM..."
                  className="flex-1 border-b border-[#3a6a9a]/30 bg-transparent font-mono text-xs text-[#a0c8e8] outline-none placeholder:text-[#3a6a9a]/20 focus:border-[#7ab0e0]/50"
                />
                <button onClick={todo.handleAdd} disabled={!todo.newText.trim() || todo.loading}
                  className="border border-[#3a6a9a]/30 px-2 py-1 font-mono text-[10px] text-[#5a8ab8]/50 hover:border-[#7ab0e0] hover:text-[#7ab0e0] disabled:opacity-30">
                  ADD
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
