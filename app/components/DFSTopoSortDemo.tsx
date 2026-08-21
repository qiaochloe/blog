"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NODES = [0, 1, 2, 3, 4, 5];
const EDGES: Array<[number, number]> = [
  [5, 0],
  [5, 2],
  [4, 0],
  [4, 1],
  [2, 3],
  [3, 1],
];
const ADJ: Record<number, number[]> = {
  0: [],
  1: [],
  2: [3],
  3: [1],
  4: [0, 1],
  5: [0, 2],
};
const POS: Record<number, [number, number]> = {
  5: [65, 52],
  4: [235, 52],
  2: [65, 143],
  0: [150, 143],
  3: [65, 234],
  1: [235, 234],
};
const START_ORDER = [5, 4, 0, 1, 2, 3];

type Step = {
  node: number | null;
  order: number[];
  stack: number[];
};

function buildSteps(): Step[] {
  const visited = new Set<number>();
  const order: number[] = [];
  const stack: number[] = [];
  const steps: Step[] = [{ node: null, stack: [], order: [] }];

  const enter = (u: number) => {
    visited.add(u);
    stack.push(u);
    steps.push({ node: u, stack: [...stack], order: [...order] });
  };

  const finish = (u: number) => {
    stack.pop();
    order.unshift(u);
    steps.push({ node: u, stack: [...stack], order: [...order] });
  };

  const dfs = (u: number) => {
    enter(u);
    for (const v of ADJ[u]) {
      if (!visited.has(v)) dfs(v);
    }
    finish(u);
  };

  for (const n of START_ORDER) {
    if (!visited.has(n)) dfs(n);
  }

  return steps;
}

type Status = "pending" | "stack" | "current" | "done";

function nodeStatus(node: number, step: Step): Status {
  if (step.node === node) return "current";
  if (step.order.includes(node)) return "done";
  if (step.stack.includes(node)) return "stack";
  return "pending";
}

const NODE_STYLE: Record<
  Status,
  { fill: string; stroke: string; strokeWidth: number; text: string }
> = {
  pending: {
    fill: "#ffffff",
    stroke: "#d4d4d4",
    strokeWidth: 1.5,
    text: "#314559",
  },
  stack: {
    fill: "#f9844a",
    stroke: "#c13806",
    strokeWidth: 1.5,
    text: "#ffffff",
  },
  current: {
    fill: "#43aa8b",
    stroke: "#2d7b61",
    strokeWidth: 2,
    text: "#ffffff",
  },
  done: {
    fill: "#4bb0d2",
    stroke: "#319dc4",
    strokeWidth: 1.5,
    text: "#ffffff",
  },
};

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

function list(value: number[]): string {
  return value.length === 0 ? "[]" : `[${value.join(", ")}]`;
}

export function DFSTopoSortDemo() {
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
          DFS Topological Sort
        </h4>
      </div>

      <div className="mx-auto flex w-fit flex-col items-center gap-4 sm:flex-row sm:gap-10">
        <svg
          viewBox="0 0 300 260"
          className="block h-auto w-[200px] sm:w-[210px]"
          role="img"
          aria-label="Directed acyclic graph with nodes 0 to 5 showing DFS topological sort"
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

          {EDGES.map(([from, to], i) => {
            const active = from === step.node;
            const p = shortenEdge(POS[from], POS[to]);
            return (
              <line
                key={i}
                x1={p.x1}
                y1={p.y1}
                x2={p.x2}
                y2={p.y2}
                stroke={active ? "#43aa8b" : "#d4d4d4"}
                strokeWidth={active ? 2 : 1.5}
                markerEnd={`url(#arrow-${active ? "active" : "idle"})`}
              />
            );
          })}

          {NODES.map((n) => {
            const [cx, cy] = POS[n];
            const style = NODE_STYLE[nodeStatus(n, step)];
            return (
              <g key={n}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={18}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={600}
                  fill={style.text}
                >
                  {n}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex w-44 flex-col gap-2.5">
          <div className="flex flex-col gap-1 whitespace-nowrap text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-tangerine-400" />
              on stack
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-sea-green-500" />
              current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-maximum-blue-500" />
              in order
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 shrink-0 rounded-full border border-neutral-300 bg-white" />
              not visited
            </span>
          </div>

          <div className="space-y-1 whitespace-nowrap">
            <div className="flex items-baseline gap-1.5">
              <span className="w-10 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Stack
              </span>
              <span className="font-mono text-xs text-neutral-800">
                {list(step.stack)}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="w-10 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Order
              </span>
              <span className="font-mono text-xs text-neutral-800">
                {list(step.order)}
              </span>
            </div>
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

