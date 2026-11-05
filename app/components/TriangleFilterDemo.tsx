"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type Kernel = "nearest" | "box" | "triangle";

const N = 8; // the input image is N by N pixels
const CELL = 22;
const PROF = 30; // thickness of the kernel profile band on the top and left
const PAD = 5;
const OX = PAD + PROF;
const OY = PAD + PROF;
const VIEW = OX + N * CELL + PAD;
const PANEL = 210; // rendered width of the input panel, in CSS pixels
const TENT_H = PROF - 8; // height of a weight of 1 in a profile band

const SCALES = [1, 1.5, 2, 3];
const KERNELS: Kernel[] = ["nearest", "box", "triangle"];

const GRID = "#4b6e82";
const FOOT = "#277da1"; // maximum-blue-700, the footprint and the weights
const CENTER = "#f86520"; // tangerine-500, the mapped output center
const TENT = "#4bb0d2"; // maximum-blue-500, the kernel profile
const AXIS = "#6b7280";

// 0 is black, 9 is white. The top half is a one pixel checker, which sits above
// the Nyquist limit as soon as s > 1, so it is where the choice of kernel shows
// up. The bottom half is a ramp and a flat block with one dark pixel in it.
const PATTERN = [
  "90909090",
  "09090909",
  "90909090",
  "09090909",
  "13577777",
  "13577707",
  "13577777",
  "13577777",
];

const IMAGE = PATTERN.map((row) => row.split("").map((d) => Number(d) / 9));

function gray(v: number): string {
  const c = Math.round(Math.max(0, Math.min(1, v)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${c}${c}${c}`;
}

function fmt(n: number): string {
  const s = n.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
}

// A box of radius 1/2, half open so that a center landing exactly between two
// input pixels picks the left one instead of both.
function boxAt(x: number): number {
  return x >= -0.5 && x < 0.5 ? 1 : 0;
}

function kernelAt(kind: Kernel, x: number): number {
  return kind === "triangle" ? Math.max(0, 1 - Math.abs(x)) : boxAt(x);
}

// Nearest keeps its native radius whatever the scale factor is, which is
// exactly what makes it alias. The others widen with s, so they stay a low
// pass filter for the lower output sample rate.
function kernelScale(kind: Kernel, s: number): number {
  return kind === "nearest" ? 1 : Math.max(1, s);
}

function radiusOf(kind: Kernel, s: number): number {
  const native = kind === "triangle" ? 1 : 0.5;
  return native * kernelScale(kind, s);
}

// Output pixel i covers [i, i + 1) in output coordinates, so its center maps
// back to (i + 0.5)s - 0.5 in input coordinates.
function centerOf(i: number, s: number): number {
  return (i + 0.5) * s - 0.5;
}

type Taps = {
  from: number; // ceil(c - R), before the image edge is taken into account
  to: number; // floor(c + R)
  raw: { j: number; w: number }[];
  // Weight per input pixel, indexed by pixel. Taps that fall off the edge of
  // the image are dropped, and the normalizing sum below makes up for them.
  acc: number[];
  sum: number;
};

function tapsOf(kind: Kernel, s: number, c: number): Taps {
  const R = radiusOf(kind, s);
  const k = kernelScale(kind, s);
  const from = Math.ceil(c - R);
  const to = Math.floor(c + R);
  const raw: { j: number; w: number }[] = [];
  const acc = new Array<number>(N).fill(0);
  let sum = 0;
  for (let j = from; j <= to; j++) {
    const w = kernelAt(kind, (j - c) / k);
    if (w === 0 || j < 0 || j >= N) continue;
    raw.push({ j, w });
    acc[j] = w;
    sum += w;
  }
  return { from, to, raw, acc, sum };
}

// The filter is separable, so the weight on input pixel (x, y) is the product
// of the two 1D weights and the normalizing sum factors the same way.
function filtered(tx: Taps, ty: Taps): number {
  let total = 0;
  for (let y = 0; y < N; y++) {
    if (ty.acc[y] === 0) continue;
    for (let x = 0; x < N; x++) {
      if (tx.acc[x] === 0) continue;
      total += tx.acc[x] * ty.acc[y] * IMAGE[y][x];
    }
  }
  return total / (tx.sum * ty.sum);
}

function weightList(t: Taps): string {
  return t.raw.map(({ w }) => fmt(w)).join(" ");
}

function rangeLabel(t: Taps): string {
  const clipped = t.from < 0 || t.to > N - 1;
  return `${t.from} .. ${t.to}${clipped ? "  clipped to the image" : ""}`;
}

// Sampled along the axis so that any kernel can be drawn with one polyline.
// `point` places a sample at input coordinate u and weight h, which is what
// differs between the band above the grid and the band to its left.
function profilePath(
  kind: Kernel,
  s: number,
  c: number,
  point: (u: number, h: number) => [number, number],
): string {
  const R = radiusOf(kind, s);
  const k = kernelScale(kind, s);
  const steps = 96;
  // Stop at the edge of the image, so the curve shows where the support of the
  // kernel runs out of pixels to weigh.
  const lo = Math.max(-0.5, c - R - 0.5);
  const hi = Math.min(N - 0.5, c + R + 0.5);
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = lo + ((hi - lo) * i) / steps;
    const [px, py] = point(u, kernelAt(kind, (u - c) / k));
    points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return `M ${points.join(" L ")}`;
}

export function TriangleFilterDemo() {
  const uid = useId().replace(/:/g, "");
  const outRef = useRef<SVGSVGElement>(null);
  const [s, setS] = useState(2);
  const [kind, setKind] = useState<Kernel>("triangle");
  const [pick, setPick] = useState({ x: 1, y: 1 });

  // Floor, so that the center of the last output pixel still lands inside
  // the input image.
  const M = Math.max(1, Math.floor(N / s));
  const ox = Math.min(pick.x, M - 1);
  const oy = Math.min(pick.y, M - 1);

  // The output panel is drawn in its own box, scaled so that one output pixel
  // is the same size on screen as one input pixel.
  const outView = 2 * PAD + M * CELL;
  const outWidth = (outView / VIEW) * PANEL;

  const cx = centerOf(ox, s);
  const cy = centerOf(oy, s);
  const R = radiusOf(kind, s);
  const tx = useMemo(() => tapsOf(kind, s, cx), [kind, s, cx]);
  const ty = useMemo(() => tapsOf(kind, s, cy), [kind, s, cy]);
  const value = filtered(tx, ty);

  const output = useMemo(() => {
    const rows: number[][] = [];
    for (let y = 0; y < M; y++) {
      const ry = tapsOf(kind, s, centerOf(y, s));
      const row: number[] = [];
      for (let x = 0; x < M; x++) {
        row.push(filtered(tapsOf(kind, s, centerOf(x, s)), ry));
      }
      rows.push(row);
    }
    return rows;
  }, [kind, s, M]);

  // Input pixel j spans [OX + j * CELL, OX + (j + 1) * CELL], so an input
  // coordinate u sits at OX + (u + 0.5) * CELL.
  const sx = (u: number) => OX + (u + 0.5) * CELL;
  const sy = (u: number) => OY + (u + 0.5) * CELL;

  const baseY = OY - 4;
  const baseX = OX - 4;

  const movePick = (dx: number, dy: number) => {
    setPick({
      x: Math.max(0, Math.min(M - 1, ox + dx)),
      y: Math.max(0, Math.min(M - 1, oy + dy)),
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") movePick(-1, 0);
    else if (e.key === "ArrowRight") movePick(1, 0);
    else if (e.key === "ArrowUp") movePick(0, -1);
    else if (e.key === "ArrowDown") movePick(0, 1);
    else return;
    e.preventDefault();
  };

  const pickAt = (clientX: number, clientY: number) => {
    const svg = outRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vx = ((clientX - rect.left) / rect.width) * outView;
    const vy = ((clientY - rect.top) / rect.height) * outView;
    const x = Math.floor((vx - PAD) / CELL);
    const y = Math.floor((vy - PAD) / CELL);
    if (x < 0 || y < 0 || x >= M || y >= M) return;
    setPick({ x, y });
  };

  const drag = (handler: (x: number, y: number) => void) => ({
    onPointerDown: (e: PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      handler(e.clientX, e.clientY);
    },
    onPointerMove: (e: PointerEvent) => {
      if (e.buttons !== 0) handler(e.clientX, e.clientY);
    },
  });

  const chip = (active: boolean) =>
    `border px-1.5 py-0.5 text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
      active
        ? "border-maximum-blue-600 bg-maximum-blue-500 text-white"
        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
    }`;

  const rows: [string, string][] = [
    ["output pixel", `(${ox}, ${oy}) of ${M} by ${M}`],
    ["center", `c = (${fmt(cx)}, ${fmt(cy)})`],
    ["radius", `R = ${fmt(R)}`],
    ["taps in x", rangeLabel(tx)],
    ["weights in x", weightList(tx)],
    ["weights in y", weightList(ty)],
    ["normalized", `f' = ${fmt(value)}   sum w = ${fmt(tx.sum * ty.sum)}`],
  ];

  const grid = (count: number, gx: number, gy: number) => (
    <g stroke={GRID} strokeOpacity={0.35} strokeWidth={0.6}>
      {Array.from({ length: count + 1 }, (_, k) => (
        <g key={k}>
          <line
            x1={gx + k * CELL}
            y1={gy}
            x2={gx + k * CELL}
            y2={gy + count * CELL}
          />
          <line
            x1={gx}
            y1={gy + k * CELL}
            x2={gx + count * CELL}
            y2={gy + k * CELL}
          />
        </g>
      ))}
    </g>
  );

  return (
    <div className="my-4 border border-neutral-200 bg-neutral-50 p-2">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
        <span className="flex items-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            s
          </span>
          {SCALES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setS(v)}
              className={chip(v === s)}
              title={`Downsample by ${v}`}
            >
              {v}
            </button>
          ))}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            k
          </span>
          {KERNELS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setKind(v)}
              className={chip(v === kind)}
              title={`Use the ${v} kernel`}
            >
              {v}
            </button>
          ))}
        </span>
      </div>

      <div className="mx-auto flex max-w-full flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-5">
        <div className="flex flex-col items-center gap-0.5">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="block h-auto w-[210px] select-none"
            role="img"
            aria-label={`The input image, with the filter footprint centered at ${fmt(
              cx,
            )}, ${fmt(cy)} and a square on each input pixel sized by its weight`}
          >
            <defs>
              <marker
                id={`${uid}-ax`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={AXIS} />
              </marker>
            </defs>

            {IMAGE.map((row, y) =>
              row.map((v, x) => (
                <rect
                  key={`${x}-${y}`}
                  x={OX + x * CELL}
                  y={OY + y * CELL}
                  width={CELL}
                  height={CELL}
                  fill={gray(v)}
                />
              )),
            )}
            {grid(N, OX, OY)}

            {/* The footprint, from c - R to c + R on both axes. */}
            <rect
              x={sx(cx - R)}
              y={sy(cy - R)}
              width={2 * R * CELL}
              height={2 * R * CELL}
              fill="none"
              stroke={FOOT}
              strokeWidth={1.4}
              strokeDasharray="3 2"
            />

            {/* One square per input pixel, with area proportional to its
                weight, so the image underneath stays visible. */}
            {ty.acc.map((wy, y) =>
              tx.acc.map((wx, x) => {
                const w = wx * wy;
                if (w === 0) return null;
                const side = CELL * 0.74 * Math.sqrt(w);
                return (
                  <rect
                    key={`w${x}-${y}`}
                    x={sx(x) - side / 2}
                    y={sy(y) - side / 2}
                    width={side}
                    height={side}
                    fill={FOOT}
                    fillOpacity={0.78}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    strokeOpacity={0.8}
                  />
                );
              }),
            )}

            {/* The mapped center, which almost never lands on a pixel center. */}
            <g
              stroke={CENTER}
              strokeWidth={1.6}
              strokeLinecap="round"
              paintOrder="stroke"
            >
              <line x1={sx(cx) - 5} y1={sy(cy)} x2={sx(cx) + 5} y2={sy(cy)} />
              <line x1={sx(cx)} y1={sy(cy) - 5} x2={sx(cx)} y2={sy(cy) + 5} />
            </g>
            <circle cx={sx(cx)} cy={sy(cy)} r={2} fill={CENTER} />

            {/* The two 1D kernels, which multiply into the squares above. */}
            <g>
              <line
                x1={OX}
                y1={baseY}
                x2={OX + N * CELL}
                y2={baseY}
                stroke={AXIS}
                strokeWidth={0.6}
                strokeOpacity={0.6}
                markerEnd={`url(#${uid}-ax)`}
              />
              <path
                d={profilePath(kind, s, cx, (u, h) => [
                  sx(u),
                  baseY - h * TENT_H,
                ])}
                fill="none"
                stroke={TENT}
                strokeWidth={1.3}
              />
              {tx.raw.map(({ j, w }) => (
                <g key={`sx${j}`}>
                  <line
                    x1={sx(j)}
                    y1={baseY}
                    x2={sx(j)}
                    y2={baseY - w * TENT_H}
                    stroke={FOOT}
                    strokeWidth={1.1}
                  />
                  <circle
                    cx={sx(j)}
                    cy={baseY - w * TENT_H}
                    r={1.4}
                    fill={FOOT}
                  />
                </g>
              ))}
            </g>

            <g>
              <line
                x1={baseX}
                y1={OY}
                x2={baseX}
                y2={OY + N * CELL}
                stroke={AXIS}
                strokeWidth={0.6}
                strokeOpacity={0.6}
                markerEnd={`url(#${uid}-ax)`}
              />
              <path
                d={profilePath(kind, s, cy, (u, h) => [
                  baseX - h * TENT_H,
                  sy(u),
                ])}
                fill="none"
                stroke={TENT}
                strokeWidth={1.3}
              />
              {ty.raw.map(({ j, w }) => (
                <g key={`sy${j}`}>
                  <line
                    x1={baseX}
                    y1={sy(j)}
                    x2={baseX - w * TENT_H}
                    y2={sy(j)}
                    stroke={FOOT}
                    strokeWidth={1.1}
                  />
                  <circle
                    cx={baseX - w * TENT_H}
                    cy={sy(j)}
                    r={1.4}
                    fill={FOOT}
                  />
                </g>
              ))}
            </g>
          </svg>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <svg
            ref={outRef}
            viewBox={`0 0 ${outView} ${outView}`}
            style={{ width: `${outWidth}px` }}
            className="block h-auto cursor-crosshair touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            tabIndex={0}
            role="img"
            aria-label={`The downsampled output, ${M} by ${M} pixels. Pixel ${ox}, ${oy} is selected and its value is ${fmt(
              value,
            )}`}
            onKeyDown={onKeyDown}
            {...drag(pickAt)}
          >
            {output.map((row, y) =>
              row.map((v, x) => (
                <rect
                  key={`${x}-${y}`}
                  x={PAD + x * CELL}
                  y={PAD + y * CELL}
                  width={CELL}
                  height={CELL}
                  fill={gray(v)}
                />
              )),
            )}
            {grid(M, PAD, PAD)}
            <rect
              x={PAD + ox * CELL}
              y={PAD + oy * CELL}
              width={CELL}
              height={CELL}
              fill="none"
              stroke={CENTER}
              strokeWidth={1.8}
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto mt-2 flex w-fit flex-col gap-0.5 px-1 font-mono text-xs text-neutral-700">
        {rows.map(([label, v]) => (
          <div key={label} className="flex items-baseline gap-2">
            <span className="w-[6.5rem] shrink-0">{label}</span>
            <span className="whitespace-pre text-neutral-900">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
