function distText(d: number): string {
  return !Number.isFinite(d) ? "∞" : String(d);
}

export function DistArray({
  nodes,
  dist,
  updated = [],
  current = null,
}: {
  nodes: number[];
  dist: Record<number, number>;
  updated?: number[];
  current?: number | null;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        Dist
      </div>
      <div className="mt-1 flex gap-[3px] font-mono text-[10px] text-neutral-400">
        {nodes.map((n) => (
          <span key={n} className="flex-1 text-center">
            {n}
          </span>
        ))}
      </div>
      <div className="mt-0.5 flex gap-[3px] font-mono text-xs font-medium">
        {nodes.map((n) => {
          const isUpdated = updated.includes(n);
          const isCurrent = n === current;
          const isInfinite = !Number.isFinite(dist[n]);
          const className = isUpdated
            ? "bg-tangerine-100 text-tangerine-700"
            : isCurrent
              ? "bg-sea-green-100 text-sea-green-700"
              : isInfinite
                ? "text-neutral-400"
                : "text-neutral-800";
          return (
            <span
              key={n}
              className={`flex min-w-0 flex-1 justify-center rounded px-0.5 py-0.5 ${className}`}
            >
              {distText(dist[n])}
            </span>
          );
        })}
      </div>
    </div>
  );
}