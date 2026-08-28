"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DistArray } from "./DistArray";

const NODES = [0, 1, 2, 3, 4, 5];
const SOURCE = 0;
const INF = Infinity;

type Edge = [number, number, number];
const EDGES: Edge[] = [
  [0, 1, 4],
  [0, 2, 2],
  [2, 1, 1],
  [2, 3, 10],
  [2, 4, 8],
  [1, 3, 5],
  [3, 5, 6],
  [4, 5, 2],
];
const POS: Record<number, [number, number]> = {
  0: [65, 52],
  1: [235, 52],
  2: [150, 143],
  3: [235, 143],
  4: [65, 234],
  5: [235, 234],
};

type Step = {
  node: number | null;
  visited: number[];
  queue: number[];
  dist: Record<number, number>;
  updated: number[];
};

function buildSteps(): Step[] {
  const dist: Record<number, number> = {};
  NODES.forEach((n) => (dist[n] = INF));
  dist[SOURCE] = 0;

  const visited: number[] = [];
  const steps: Step[] = [];

  const effectiveQueue = () =>
    NODES.filter((n) => !visited.includes(n) && dist[n] !== INF)
      .sort((a, b) => dist[a] - dist[b] || a - b);

  steps.push({
    node: null,
    visited: [...visited],
    queue: effectiveQueue(),
    dist: { ...dist },
    updated: [],
  });

  const done = new Set<number>();
  while (true) {
    let u: number | null = null;
    let best = INF;
    for (const n of NODES) {
      if (!done.has(n) && dist[n] < best) {
        best = dist[n];
        u = n;
      }
    }
    if (u === null || best === INF) break;

    done.add(u);
    visited.push(u);

    const updated: number[] = [];
    for (const [from, to, w] of EDGES) {
      if (from !== u) continue;
      if (dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        updated.push(to);
      }
    }

    steps.push({
      node: u,
      visited: [...visited],
      queue: effectiveQueue(),
      dist: { ...dist },
      updated,
    });
  }

  return steps;
}

type Status = "pending" | "current" | "done";

function nodeStatus(node: number, step: Step): Status {
  if (step.node === node) return "current";
  if (step.visited.includes(node)) return "done";
  return "pending";
}

function distText(d: number): string {
  return d === INF ? "∞" : String(d);
}

function shortenEdge(a: [number, number], b: [number, number]) {
  const r1 = 18;
  const r2 = 18;
  const arrow = 7;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * r1,
    y1: y1 + uy * r1,
    x2: x2 - ux * (r2 + arrow),
    y2: y2 - uy * (r2 + arrow),
  };
}

function edgeLabelPos(a: [number, number], b: [number, number]) {
  const p = shortenEdge(a, b);
  const mx = (p.x1 + p.x2) / 2;
  const my = (p.y1 + p.y2) / 2;
  return [mx, my] as const;
}

function set(value: number[]): string {
  return value.length === 0 ? "{}" : `{${value.join(", ")}}`;
}

function queueList(value: number[]): string {
  return value.length === 0 ? "[]" : `[${value.join(", ")}]`;
}

export function DijkstraDemo() {
  const steps = useMemo(buildSteps, []);
  const [index, setIndex] = useState(0);
  const last = steps.length - 1;
  const step = steps[index];

  const goTo = (i: number) => {
    setIndex(Math.max(0, Math.min(last, i)));
  };

  const arrowClass =
    "flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

  return (
    <div className="my-4 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
      <div className="mb-1.5 px-1">
        <h4 className="m-0 text-sm font-semibold text-blue-slate-800">
          Dijkstra&apos;s Algorithm
        </h4>
      </div>

      <div className="mx-auto flex w-fit flex-col items-center gap-4 sm:flex-row sm:gap-10">
        <svg
          viewBox="0 0 300 260"
          className="block h-auto w-[200px] sm:w-[210px]"
          role="img"
          aria-label="Weighted directed graph with 6 nodes showing Dijkstra's algorithm"
        >
          <defs>
            <marker
              id="arrow-idle"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#d4d4d4" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#43aa8b" />
            </marker>
          </defs>

          {EDGES.map(([from, to, w], i) => {
            const active = from === step.node;
            const relaxed = active && step.updated.includes(to);
            const p = shortenEdge(POS[from], POS[to]);
            const [lx, ly] = edgeLabelPos(POS[from], POS[to]);
            return (
              <g key={i}>
                <line
                  x1={p.x1}
                  y1={p.y1}
                  x2={p.x2}
                  y2={p.y2}
                  stroke={relaxed ? "#f9844a" : active ? "#43aa8b" : "#d4d4d4"}
                  strokeWidth={relaxed ? 2.5 : active ? 2 : 1.5}
                  markerEnd={`url(#arrow-${active ? "active" : "idle"})`}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={600}
                  fill="#445d74"
                  paintOrder="stroke"
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {w}
                </text>
              </g>
            );
          })}

          {NODES.map((n) => {
            const [cx, cy] = POS[n];
            const status = nodeStatus(n, step);
            const isUpdated = step.updated.includes(n);
            const fill =
              status === "current"
                ? "#43aa8b"
                : status === "done"
                  ? "#4bb0d2"
                  : "#ffffff";
            const stroke =
              status === "current"
                ? "#2d7b61"
                : status === "done"
                  ? "#319dc4"
                  : "#d4d4d4";
            const strokeWidth = status === "current" ? 2 : 1.5;
            const text =
              status === "current" || status === "done" ? "#ffffff" : "#314559";
            return (
              <g key={n}>
                {isUpdated && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={22}
                    fill="none"
                    stroke="#f9844a"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={18}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={600}
                  fill={text}
                >
                  {n}
                </text>
                <circle
                  cx={cx + 15}
                  cy={cy - 15}
                  r={9}
                  fill={isUpdated ? "#f9844a" : "#ffffff"}
                  stroke={isUpdated ? "#c13806" : "#d4d4d4"}
                />
                <text
                  x={cx + 15}
                  y={cy - 15}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8.5}
                  fontWeight={600}
                  fill={isUpdated ? "#ffffff" : "#445d74"}
                >
                  {distText(step.dist[n])}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex w-44 flex-col gap-2.5">
          <div className="flex flex-col gap-1 whitespace-nowrap text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-tangerine-400" />
              distance updated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-sea-green-500" />
              current node
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-maximum-blue-500" />
              visited
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full border border-neutral-300 bg-white" />
              not visited
            </span>
          </div>

          <div className="space-y-1 whitespace-nowrap">
            <div className="flex items-baseline gap-1.5">
              <span className="w-11 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Queue
              </span>
              <span className="font-mono text-xs text-neutral-800">
                {queueList(step.queue)}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="w-11 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Visited
              </span>
              <span className="font-mono text-xs text-neutral-800">
                {set(step.visited)}
              </span>
            </div>
          </div>

          <DistArray
            nodes={NODES}
            dist={step.dist}
            updated={step.updated}
            current={step.node}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className={arrowClass}
          aria-label="Previous step"
          title="Previous step"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to step ${i}`}
            title={`Step ${i}`}
            className={`h-1.5 w-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
              i <= index ? "bg-maximum-blue-500" : "bg-neutral-300"
            } ${i === index ? "scale-125" : ""}`}
          />
        ))}
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === last}
          className={arrowClass}
          aria-label="Next step"
          title="Next step"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}