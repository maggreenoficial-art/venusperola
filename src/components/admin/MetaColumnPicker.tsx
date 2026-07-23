"use client";

import { useMemo, useState } from "react";
import { Search, Settings2, X } from "lucide-react";
import {
  columnsForLevel,
  getDefaultVisibleColumns,
  META_COLUMN_GROUPS,
  pinnedColumnIds,
  type ManagerLevel,
} from "@/lib/meta-ads-columns";

interface MetaColumnPickerProps {
  level: ManagerLevel;
  visibleIds: string[];
  onChange: (ids: string[]) => void;
}

export function MetaColumnPicker({
  level,
  visibleIds,
  onChange,
}: MetaColumnPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(visibleIds);

  const allColumns = useMemo(() => columnsForLevel(level), [level]);
  const pinned = useMemo(() => pinnedColumnIds(level), [level]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allColumns;
    return allColumns.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [allColumns, search]);

  const openModal = () => {
    setDraft(visibleIds);
    setSearch("");
    setOpen(true);
  };

  const toggle = (id: string) => {
    if (pinned.includes(id)) return;
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const apply = () => {
    onChange([...new Set([...pinned, ...draft])]);
    setOpen(false);
  };

  const reset = () => setDraft(getDefaultVisibleColumns(level));

  const selectAll = () => {
    setDraft(allColumns.map((c) => c.id));
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs hover:border-accent hover:text-accent"
      >
        <Settings2 size={14} />
        Personalizar colunas
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col border border-white/10 bg-black">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-sm font-medium">Personalize as colunas</h3>
                <p className="mt-0.5 text-[10px] text-muted">
                  Escolha como visualizar as colunas na tabela
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2 border border-white/10 px-3 py-2">
                <Search size={14} className="text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por coluna..."
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted"
                  autoFocus
                />
              </div>
              <div className="mt-2 flex gap-3 text-[10px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-accent hover:underline"
                >
                  Selecionar todas
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="text-muted hover:text-white"
                >
                  Restaurar padrão
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {META_COLUMN_GROUPS.map((group) => {
                const items = filtered.filter((c) => c.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="mb-5">
                    <p className="mb-2 text-[10px] tracking-widest text-muted uppercase">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {items.map((col) => {
                        const isPinned = pinned.includes(col.id);
                        const checked = draft.includes(col.id) || isPinned;
                        return (
                          <label
                            key={col.id}
                            className={`flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/[0.03] ${
                              isPinned ? "opacity-60" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isPinned}
                              onChange={() => toggle(col.id)}
                              className="accent-accent"
                            />
                            <span className="text-xs">{col.label}</span>
                            {isPinned && (
                              <span className="ml-auto text-[10px] text-muted">
                                Fixa
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 border-t border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-white/10 py-2.5 text-xs text-muted hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-1 rounded-full bg-white py-2.5 text-xs font-semibold text-black hover:bg-accent"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
