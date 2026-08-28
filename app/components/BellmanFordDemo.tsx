"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DistArray } from "./DistArray";

const NODES = [0, 1, 2, 3, 4, 5];
const SOURCE = 0;
const INF = Infinity;

type Edge = [number, number, number];
const EDGES: Edge[] = [
  [4, 5, 1],
  [3, 4, 1],
  [2, 3, 1],
  [1, 3, -1],
  [1, 2, 1],
  [0, 1, 2],
  [0, 5, 10],
];
const POS: Record<number, [number, number]> = {
  0: [65, 52],
  1: [235, 52],
  2: [235, 143],
  3: [65, 143],
  4: [65, 234],
  5: [235, 234],
};

type Step = {
  dist: Record<number, number>;
  relaxed: Array<[number, number]>;
};

function buildSteps(): Step[] {
  const dist: Record<number, number> = {};
  NODES.forEach((n) => (dist[n] = INF));
  dist[SOURCE] = 0;

  const steps: Step[] = [];
  const snapshot = (relaxed: Array<[number, number]>) => ({
    dist: { ...dist },
    relaxed,
  });

  steps.push(snapshot([]));

  for (let pass = 1; pass <= NODES.length - 1; pass++) {
    const relaxed: Array<[number, number]> = [];
    for (const [u, v, w] of EDGES) {
      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        relaxed.push([u, v]);
      }
    }
    steps.push(snapshot(relaxed));
  }

  return steps;
}

type Status = "unreached" | "reached" | "updated";

function nodeStatus(node: number, step: Step): Status {
  if (node === SOURCE) return "reached";
  if (step.relaxed.some(([to]) => to === node)) return "updated";
  return step.dist[node] === INF ? "unreached" : "reached";
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
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = dy / len;
  const py = -dx / len;
  return [mx + px * 10, my + py * 10] as const;
}

export function BellmanFordDemo() {
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
          Bellman-Ford Algorithm
        </h4>
      </div>

      <div className="mx-auto flex w-fit flex-col items-center gap-4 sm:flex-row sm:gap-10">
        <svg
          viewBox="0 0 300 260"
          className="block h-auto w-[200px] sm:w-[210px]"
          role="img"
          aria-label="Weighted directed graph with 6 nodes showing the Bellman-Ford algorithm"
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
            const relaxed = step.relaxed.some(
              ([u, v]) => u === from && v === to,
            );
            const p = shortenEdge(POS[from], POS[to]);
            const [lx, ly] = edgeLabelPos(POS[from], POS[to]);
            const [x1, y1] = POS[from];
            const [x2, y2] = POS[to];
            const negative = w < 0;
            return (
              <g key={i}>
                <line
                  x1={p.x1}
                  y1={p.y1}
                  x2={p.x2}
                  y2={p.y2}
                  stroke={relaxed ? "#43aa8b" : "#d4d4d4"}
                  strokeWidth={relaxed ? 2.5 : 1.5}
                  strokeDasharray={negative ? "4 3" : undefined}
                  markerEnd={`url(#arrow-${relaxed ? "active" : "idle"})`}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={600}
                  fill={negative ? "#c13806" : "#445d74"}
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
            const fill =
              status === "updated"
                ? "#f9844a"
                : status === "reached"
                  ? "#4bb0d2"
                  : "#ffffff";
            const stroke =
              status === "updated"
                ? "#c13806"
                : status === "reached"
                  ? "#319dc4"
                  : "#d4d4d4";
            const strokeWidth = status === "updated" ? 2 : 1.5;
            const text =
              status === "updated" || status === "reached"
                ? "#ffffff"
                : "#314559";
            return (
              <g key={n}>
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
                  fill={status === "updated" ? "#f9844a" : "#ffffff"}
                  stroke={status === "updated" ? "#c13806" : "#d4d4d4"}
                />
                <text
                  x={cx + 15}
                  y={cy - 15}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8.5}
                  fontWeight={600}
                  fill={status === "updated" ? "#ffffff" : "#445d74"}
                >
                  {distText(step.dist[n])}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex w-48 flex-col gap-2.5">
          <div className="flex flex-col gap-1 whitespace-nowrap text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-tangerine-400" />
              distance updated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-maximum-blue-500" />
              reached
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full border border-neutral-300 bg-white" />
              unreached
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-3.5 border-b-2 border-dashed border-neutral-300" />
              negative weight
            </span>
          </div>

          <div className="space-y-1.5">
            <DistArray
              nodes={NODES}
              dist={step.dist}
              updated={Array.from(new Set(step.relaxed.map(([, to]) => to)))}
            />
          </div>
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
