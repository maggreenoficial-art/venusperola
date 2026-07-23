"use client";

import type { ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import type {
  ManagerLevel,
  MetaColumnDef,
  MetaTableContext,
  MetaTableRow,
} from "@/lib/meta-ads-columns";
import type { MetaAdsAd } from "@/lib/meta-ads-types";

interface MetaManagerTableProps {
  level: ManagerLevel;
  columns: MetaColumnDef[];
  rows: MetaTableRow[];
  context: MetaTableContext;
  countLabel: string;
  emptyMessage: string;
  onNameClick?: (row: MetaTableRow) => void;
  onToggle?: (row: MetaTableRow) => void;
  getSubtext?: (row: MetaTableRow) => string;
}

export function MetaManagerTable({
  columns,
  rows,
  context,
  countLabel,
  emptyMessage,
  onNameClick,
  onToggle,
  getSubtext,
}: MetaManagerTableProps) {
  const nameColumn = columns.find((c) => c.id.startsWith("name_"));
  const dataColumns = columns.filter(
    (c) => !c.pinned && !c.id.startsWith("name_")
  );
  const statusColumn = columns.find((c) => c.id === "status");
  const displayColumns = [
    ...(statusColumn ? [statusColumn] : []),
    ...(nameColumn ? [nameColumn] : []),
    ...dataColumns.filter((c) => c.id !== "status"),
  ];

  const colSpan = displayColumns.length + (onToggle ? 1 : 0);

  return (
    <table className="w-full min-w-[900px] text-left text-xs">
      <thead className="border-b border-white/10 text-[10px] tracking-widest text-muted uppercase">
        <tr>
          {displayColumns.map((col) => (
            <th
              key={col.id}
              className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}
            >
              {col.label}
            </th>
          ))}
          {onToggle && <th className="px-4 py-3" />}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={colSpan} className="px-4 py-12 text-center text-muted">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-white/5 hover:bg-white/[0.02]"
            >
              {displayColumns.map((col) => (
                <td
                  key={col.id}
                  className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}
                >
                  {renderCell(col, row, context, {
                    onNameClick,
                    getSubtext,
                  })}
                </td>
              ))}
              {onToggle && (
                <td className="px-4 py-3 text-right">
                  <ToggleButton
                    active={row.status === "ACTIVE"}
                    onClick={() => onToggle(row)}
                  />
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
      {rows.length > 0 && (
        <tfoot className="border-t border-white/10 bg-white/[0.02] font-medium">
          <tr>
            <td className="px-4 py-3" colSpan={Math.min(2, displayColumns.length)}>
              {countLabel}
            </td>
            {displayColumns.slice(2).map((col) => (
              <td
                key={`agg-${col.id}`}
                className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.getAggregate ? col.getAggregate(rows, context) : ""}
              </td>
            ))}
            {onToggle && <td className="px-4 py-3" />}
          </tr>
        </tfoot>
      )}
    </table>
  );
}

function renderCell(
  col: MetaColumnDef,
  row: MetaTableRow,
  ctx: MetaTableContext,
  helpers: {
    onNameClick?: (row: MetaTableRow) => void;
    getSubtext?: (row: MetaTableRow) => string;
  }
): ReactNode {
  if (col.id === "status") {
    const status = row.effectiveStatus ?? row.status;
    return <StatusBadge status={status} />;
  }

  if (col.id.startsWith("name_")) {
    const subtext = helpers.getSubtext?.(row);
    const thumb =
      "thumbnailUrl" in row && row.thumbnailUrl ? (row as MetaAdsAd) : null;

    if (helpers.onNameClick) {
      return (
        <button
          type="button"
          onClick={() => helpers.onNameClick?.(row)}
          className="flex items-center gap-3 text-left hover:text-accent"
        >
          {thumb?.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb.thumbnailUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded object-cover"
            />
          )}
          <span>
            <p className="font-medium">{row.name}</p>
            {subtext && (
              <p className="text-[10px] text-muted">{subtext}</p>
            )}
          </span>
        </button>
      );
    }

    return (
      <div>
        <p className="font-medium">{row.name}</p>
        {subtext && <p className="text-[10px] text-muted">{subtext}</p>}
      </div>
    );
  }

  return col.getValue(row, ctx);
}

function ToggleButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-white/10 p-1.5 hover:border-accent hover:text-accent"
      title={active ? "Pausar" : "Ativar"}
    >
      {active ? <Pause size={12} /> : <Play size={12} />}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
        active
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-white/5 text-muted"
      }`}
    >
      {status}
    </span>
  );
}
