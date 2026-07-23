"use client";

import { useEffect, useMemo, useState } from "react";

interface PearlsDisplayProps {
  count: number;
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  compact?: boolean;
}

function Pearl({ index, size }: { index: number; size: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={`pearl ${sizes[size]}`}
      style={{ animationDelay: `${index * 0.12}s` }}
      aria-hidden
    >
      <span className="pearl-shine" />
    </span>
  );
}

export function PearlsDisplay({
  count,
  maxVisible = 12,
  size = "md",
  compact = false,
}: PearlsDisplayProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (count === 0) {
      setDisplayCount(0);
      return;
    }

    setDisplayCount(0);
    const interval = setInterval(() => {
      setDisplayCount((prev) => {
        if (prev >= Math.min(count, maxVisible)) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [count, maxVisible]);

  const visiblePearls = useMemo(
    () => Math.min(count, maxVisible),
    [count, maxVisible]
  );
  const overflow = count > maxVisible ? count - maxVisible : 0;

  return (
    <div className="pearls-display">
      <div className="pearls-cluster" aria-label={`${count} pérolas de fidelidade`}>
        {displayCount === 0 && count === 0 ? (
          <div className="pearls-empty">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className="pearl pearl--empty h-4 w-4"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        ) : (
          <>
            {Array.from({ length: displayCount }).map((_, i) => (
              <Pearl key={i} index={i} size={size} />
            ))}
            {overflow > 0 && displayCount >= maxVisible && (
              <span className="pearls-overflow">+{overflow}</span>
            )}
          </>
        )}
      </div>

      <p className={`pearls-count ${compact ? "sr-only" : ""}`}>
        <span className="pearls-count-number">{count}</span>
        <span className="pearls-count-label">
          {count === 1 ? "pérola" : "pérolas"}
        </span>
      </p>
    </div>
  );
}
