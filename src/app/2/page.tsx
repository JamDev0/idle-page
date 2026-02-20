"use client";

import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useMedia } from "@/hooks/useMedia";
import { MediaRenderer } from "@/components/MediaRenderer";
import type { Task } from "@/types/task";

function Scanlines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden opacity-[0.03]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.08) 2px, rgba(0,255,65,0.08) 4px)",
        }}
      />
    </div>
  );
}

function TerminalTask({ task, todo, index }: { task: Task; todo: ReturnType<typeof useTodos>; index: number }) {
  const fullIdx = todo.indexInFullList(task);
  const isEditing = todo.editingId === task.id && !todo.readOnly;

  return (
    <li className="group font-mono">
      <div className="flex items-start gap-0">
        <span className="shrink-0 select-none text-green-800">{String(index + 1).padStart(2, "0")}.</span>
        <span className="mx-1.5 shrink-0 select-none">&gt;</span>

        <button
          type="button"
          onClick={() => todo.handleToggle(task)}
          disabled={todo.readOnly}
          className="shrink-0 select-none text-green-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          [{task.checked ? "x" : " "}]
        </button>

        {isEditing ? (
          <div className="ml-1.5 flex flex-1 items-center">
            <input
              type="text"
              value={todo.editText}
              onChange={(e) => todo.setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") todo.handleSaveEdit(task.id);
                if (e.key === "Escape") { todo.setEditingId(null); todo.setEditText(""); }
              }}
              className="flex-1 border-b border-green-700/50 bg-transparent px-1 text-green-300 caret-green-400 outline-none"
              autoFocus
            />
            <button onClick={() => todo.handleSaveEdit(task.id)} className="ml-2 text-green-600 hover:text-green-400">[SAVE]</button>
          </div>
        ) : (
          <>
            <span className={`ml-1.5 flex-1 ${task.checked ? "text-green-900 line-through" : "text-green-300"}`}>
              {task.text || "(null)"}
            </span>
            <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => todo.moveUp(fullIdx)} disabled={todo.readOnly || !todo.canMoveUp(task)}
                className="text-green-800 hover:text-green-400 disabled:hidden">[UP]</button>
              <button onClick={() => todo.moveDown(fullIdx)} disabled={todo.readOnly || !todo.canMoveDown(task)}
                className="text-green-800 hover:text-green-400 disabled:hidden">[DN]</button>
              <button onClick={() => todo.startEdit(task)} disabled={todo.readOnly}
                className="text-green-800 hover:text-green-400 disabled:hidden">[ED]</button>
              <button onClick={() => todo.handleDelete(task.id)} disabled={todo.readOnly}
                className="text-green-800 hover:text-red-500 disabled:hidden">[RM]</button>
            </span>
          </>
        )}
      </div>
    </li>
  );
}

export default function TerminalVariant() {
  const todo = useTodos();
  const media = useMedia();

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a] font-mono text-green-400"
      style={{ animation: "crt-flicker 0.15s infinite" }}
    >
      <Scanlines />

      {/* CRT vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Split layout: media left 60%, terminal right 40% */}
      <div className="relative z-10 flex h-full">
        {/* Media pane */}
        <div className="flex h-full w-[60%] flex-col border-r border-green-900/30">
          <div className="flex items-center gap-2 border-b border-green-900/30 px-4 py-2">
            <span className="text-xs text-green-700">MEDIA://DISPLAY</span>
            <span className="ml-auto text-[10px] text-green-900">
              {media.items.length > 0
                ? `[${(media.currentIndex ?? 0) + 1}/${media.items.length}]`
                : "[EMPTY]"}
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center bg-[#060606]">
            {media.loading ? (
              <p className="text-sm text-green-800">LOADING...</p>
            ) : (
              <MediaRenderer
                item={media.currentItem}
                onNext={media.goNext}
                imgClassName="max-h-[80vh] max-w-[55vw] object-contain opacity-90"
                videoClassName="max-h-[80vh] max-w-[55vw] object-contain opacity-90"
                emptyClassName="text-green-900"
                emptyText="NO_MEDIA_FOUND"
              />
            )}
          </div>
          <div className="flex items-center gap-3 border-t border-green-900/30 px-4 py-2">
            <button onClick={media.goPrev} className="text-xs text-green-700 hover:text-green-400">[&lt; PREV]</button>
            <button onClick={media.goNext} className="text-xs text-green-700 hover:text-green-400">[NEXT &gt;]</button>
          </div>
        </div>

        {/* Terminal pane */}
        <div className="flex h-full w-[40%] flex-col">
          <div className="flex items-center gap-2 border-b border-green-900/30 px-4 py-2">
            <span className="text-xs text-green-700">TODO://CHECKLIST</span>
            <span className="ml-auto text-[10px] text-green-900">
              {todo.visibleTasks.length} items
            </span>
            <Link href="/settings" className="text-[10px] text-green-900 hover:text-green-600">[CONF]</Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="mb-3 text-xs text-green-800">
              <span>idle-page v0.1.0</span>
              <br />
              <span>type below to add tasks. press enter to confirm.</span>
              <br />
              <span className="text-green-900">---</span>
            </div>

            {!todo.filePath.trim() ? (
              <p className="text-xs text-green-800">
                ERR: no file path configured.{" "}
                <Link href="/settings" className="underline hover:text-green-400">run config</Link>
              </p>
            ) : (
              <>
                {todo.error && <p className="mb-2 text-xs text-red-500">ERR: {todo.error}</p>}
                {todo.isWatcherDegraded && (
                  <p className="mb-2 text-xs text-yellow-600">WARN: {todo.watcherMessage}</p>
                )}
                {todo.readOnly && <p className="mb-2 text-xs text-yellow-600">MODE: READ-ONLY</p>}
                {todo.externalChangeBanner && (
                  <p className="mb-2 text-xs text-yellow-700">
                    NOTICE: {todo.externalChangeBanner}{" "}
                    <button onClick={() => todo.setExternalChangeBanner(null)} className="underline">[OK]</button>
                  </p>
                )}

                <ul className="space-y-1 text-xs">
                  {todo.visibleTasks.map((task, i) => (
                    <TerminalTask key={task.id} task={task} todo={todo} index={i} />
                  ))}
                </ul>

                {!todo.readOnly && (
                  <div className="mt-4 flex items-center gap-0 text-xs">
                    <span className="select-none text-green-700">$&gt; </span>
                    <input
                      type="text"
                      value={todo.newText}
                      onChange={(e) => todo.setNewText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && todo.handleAdd()}
                      placeholder="add task..."
                      className="flex-1 bg-transparent text-green-300 caret-green-400 outline-none placeholder:text-green-900"
                    />
                    <span
                      className="inline-block h-4 w-2 bg-green-500"
                      style={{ animation: "cursor-blink 1s step-end infinite" }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Variant nav */}
      <nav className="absolute left-4 top-4 z-50 flex items-center gap-1 font-mono text-[10px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Link
            key={n}
            href={`/${n}`}
            className={`px-1.5 py-0.5 ${n === 2 ? "bg-green-400 text-black" : "text-green-900 hover:text-green-500"}`}
          >
            {n}
          </Link>
        ))}
      </nav>
    </div>
  );
}
