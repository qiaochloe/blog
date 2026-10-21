"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { RotateCcw } from "lucide-react";

type Shape = "cube" | "cylinder" | "cone" | "sphere";
// "side" is the curved part of a cylinder, cone, or sphere. The rest are the
// flat faces, named by the axis their normal points along, and shared between
// the cube and the caps of a cylinder or cone.
type Face = "side" | "px" | "nx" | "py" | "ny" | "pz" | "nz";
type V3 = [number, number, number];

const R_SHAPE = 0.5;
const TAU = Math.PI * 2;
const EPS = 1e-6;
const CELLS = 8;
const MARKER = "#f9844a";
const GRID = "#4b6e82";

const PALETTE: Record<Face, [string, string]> = {
  side: ["#d6f5fa", "#91d8e8"],
  px: ["#f3cbc4", "#de938c"],
  nx: ["#e9d6b9", "#caa67d"],
  py: ["#fde5a5", "#f9c74f"],
  ny: ["#ebf5db", "#bcd699"],
  pz: ["#d6f5fa", "#91d8e8"],
  nz: ["#c8dbe4", "#9ab5c6"],
};

function sub(a: V3, b: V3): V3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function dot(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(a: V3, b: V3): V3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function norm(a: V3): V3 {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function fmt(n: number): string {
  const s = n.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
}
// A leading space where the minus sign would go keeps the decimal points in
// a column, so values don't jitter sideways as the point moves.
function pad(n: number): string {
  return (n < 0 ? "" : " ") + fmt(n);
}
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => Math.max(0, Math.min(255, Math.round(v * f))))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
  return `#${c}`;
}

/* ---------- camera ---------- */

type Cam = { eye: V3; right: V3; up: V3; scale: number };

const YAW = (60 * Math.PI) / 180;
const PITCH = (20 * Math.PI) / 180;
const VIEW = 220;
const CX = VIEW / 2;
const CY = VIEW / 2 + 4;
// A cube reaches further from the origin than a shape of the same radius, so
// it is drawn smaller to keep every shape about the same size on screen.
const SCALES: Record<Shape, number> = {
  cube: 100,
  cylinder: 132,
  cone: 132,
  sphere: 132,
};

function makeCam(yaw: number, pitch: number, scale: number): Cam {
  // eye points from the origin toward the camera, so dot(p, eye) is depth.
  const eye: V3 = [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  ];
  const right = norm([eye[2], 0, -eye[0]]);
  return { eye, right, up: cross(eye, right), scale };
}

// Two opposite viewpoints. Between them every face of every shape can be
// reached: the first sees +x, +y and +z, the second sees -x, -y and -z.
function viewOf(shape: Shape, back: boolean): Cam {
  return back
    ? makeCam(YAW + Math.PI, -PITCH, SCALES[shape])
    : makeCam(YAW, PITCH, SCALES[shape]);
}

const LIGHT: V3 = norm([0.35, 0.8, 0.55]);

function project(cam: Cam, p: V3): [number, number] {
  return [
    CX + cam.scale * dot(p, cam.right),
    CY - cam.scale * dot(p, cam.up),
  ];
}

function pointsAttr(cam: Cam, ps: V3[]): string {
  return ps
    .map((p) => {
      const [x, y] = project(cam, p);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

/* ---------- parameterization ---------- */

// Each flat face is a unit square anchored at `origin`, running along `du` as
// u goes 0 to 1 and along `dv` as v does. The axes are picked so that the
// texture stays the right way up as you walk around the shape.
type Plane = {
  origin: V3;
  du: V3;
  dv: V3;
  n: V3;
  uExpr: string;
  vExpr: string;
};

const PLANES: Record<Exclude<Face, "side">, Plane> = {
  px: {
    origin: [0.5, -0.5, 0.5],
    du: [0, 0, -1],
    dv: [0, 1, 0],
    n: [1, 0, 0],
    uExpr: "u = -pz + 0.5",
    vExpr: "v = py + 0.5",
  },
  nx: {
    origin: [-0.5, -0.5, -0.5],
    du: [0, 0, 1],
    dv: [0, 1, 0],
    n: [-1, 0, 0],
    uExpr: "u = pz + 0.5",
    vExpr: "v = py + 0.5",
  },
  py: {
    origin: [-0.5, 0.5, 0.5],
    du: [1, 0, 0],
    dv: [0, 0, -1],
    n: [0, 1, 0],
    uExpr: "u = px + 0.5",
    vExpr: "v = -pz + 0.5",
  },
  ny: {
    origin: [-0.5, -0.5, -0.5],
    du: [1, 0, 0],
    dv: [0, 0, 1],
    n: [0, -1, 0],
    uExpr: "u = px + 0.5",
    vExpr: "v = pz + 0.5",
  },
  pz: {
    origin: [-0.5, -0.5, 0.5],
    du: [1, 0, 0],
    dv: [0, 1, 0],
    n: [0, 0, 1],
    uExpr: "u = px + 0.5",
    vExpr: "v = py + 0.5",
  },
  nz: {
    origin: [0.5, -0.5, -0.5],
    du: [-1, 0, 0],
    dv: [0, 1, 0],
    n: [0, 0, -1],
    uExpr: "u = -px + 0.5",
    vExpr: "v = py + 0.5",
  },
};

const CUBE_FACES = ["px", "nx", "py", "ny", "pz", "nz"] as const;

// (a, b) are normalized surface parameters in [0, 1]: for a flat face they are
// exactly (u, v); for the curved side, the angle around the shape and the
// normalized height. They part ways with (u, v) only at the apex of a cone and
// at the poles of a sphere, which is what the special cases in uvFrom are for.
function pointFrom(shape: Shape, face: Face, a: number, b: number): V3 {
  if (face !== "side") {
    const { origin, du, dv } = PLANES[face];
    return [
      origin[0] + a * du[0] + b * dv[0],
      origin[1] + a * du[1] + b * dv[1],
      origin[2] + a * du[2] + b * dv[2],
    ];
  }
  const theta = -TAU * a;
  if (shape === "sphere") {
    const phi = (b - 0.5) * Math.PI;
    const r = R_SHAPE * Math.cos(phi);
    return [r * Math.cos(theta), R_SHAPE * Math.sin(phi), r * Math.sin(theta)];
  }
  const y = b - 0.5;
  const r = shape === "cone" ? (0.5 - y) / 2 : R_SHAPE;
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
}

function paramsFrom(shape: Shape, face: Face, p: V3): [number, number] {
  if (face !== "side") {
    const { origin, du, dv } = PLANES[face];
    const rel = sub(p, origin);
    return [dot(rel, du), dot(rel, dv)];
  }
  let a = -Math.atan2(p[2], p[0]) / TAU;
  if (a < 0) a += 1;
  const b =
    shape === "sphere"
      ? Math.asin(Math.max(-1, Math.min(1, p[1] / R_SHAPE))) / Math.PI + 0.5
      : p[1] + 0.5;
  return [a, b];
}

function normalAt(shape: Shape, face: Face, p: V3): V3 {
  if (face !== "side") return PLANES[face].n;
  if (shape === "sphere") return norm(p);
  if (shape === "cone") {
    const n: V3 = [2 * p[0], 0.5 * (0.5 - p[1]), 2 * p[2]];
    // The apex has no normal of its own, so borrow the axis.
    return Math.hypot(n[0], n[1], n[2]) < EPS ? [0, 1, 0] : norm(n);
  }
  return norm([p[0], 0, p[2]]);
}

type Readout = { u: number; v: number; lines: [string, string][] };

function uvFrom(shape: Shape, face: Face, p: V3): Readout {
  const [px, py, pz] = p;
  const coords: [string, string] = [
    "p",
    `(${fmt(px)}, ${fmt(py)}, ${fmt(pz)})`,
  ];

  if (face !== "side") {
    const plane = PLANES[face];
    const [u, v] = paramsFrom(shape, face, p);
    return {
      u,
      v,
      lines: [coords, [plane.uExpr, pad(u)], [plane.vExpr, pad(v)]],
    };
  }

  if (shape === "cone" && py >= 0.5 - 1e-4) {
    return {
      u: 0.5,
      v: 0.5,
      lines: [
        coords,
        ["every θ meets here", "so u, v default"],
        ["(u, v) = (0.5, 0.5)", pad(0.5) + ", " + pad(0.5)],
      ],
    };
  }

  const theta = Math.atan2(pz, px);
  const u = theta < 0 ? -theta / TAU : 1 - theta / TAU;
  const uLine: [string, string] =
    theta < 0 ? ["u = -θ / 2π", pad(u)] : ["u = 1 - θ / 2π", pad(u)];

  if (shape === "sphere") {
    const phi = Math.asin(Math.max(-1, Math.min(1, py / R_SHAPE)));
    const v = phi / Math.PI + 0.5;
    if (v <= 1e-4 || v >= 1 - 1e-4) {
      const pole = v > 0.5 ? 1 : 0;
      return {
        u: 0.5,
        v: pole,
        lines: [
          coords,
          ["φ = asin(py / r)", pad(phi)],
          ["v = φ / π + 0.5", pad(pole)],
          ["θ undefined, so u = 0.5", pad(0.5)],
        ],
      };
    }
    return {
      u,
      v,
      lines: [
        coords,
        ["φ = asin(py / r)", pad(phi)],
        ["v = φ / π + 0.5", pad(v)],
        ["θ = atan2(pz, px)", pad(theta)],
        uLine,
      ],
    };
  }

  const v = py + 0.5;
  return {
    u,
    v,
    lines: [
      coords,
      ["θ = atan2(pz, px)", pad(theta)],
      uLine,
      ["v = py + 0.5", pad(v)],
    ],
  };
}

/* ---------- picking ---------- */

type Hit = { t: number; face: Face };

function quadratic(A: number, B: number, C: number): number[] {
  if (Math.abs(A) < EPS) return Math.abs(B) < EPS ? [] : [-C / B];
  const disc = B * B - 4 * A * C;
  if (disc < 0) return [];
  const s = Math.sqrt(disc);
  return [(-B - s) / (2 * A), (-B + s) / (2 * A)];
}

function intersect(shape: Shape, o: V3, d: V3): Hit | null {
  const hits: Hit[] = [];
  const at = (t: number): V3 => [
    o[0] + t * d[0],
    o[1] + t * d[1],
    o[2] + t * d[2],
  ];

  // A cap of a cylinder or cone: the plane y = +-0.5, bounded by the disk.
  const cap = (y: number, face: Face) => {
    if (Math.abs(d[1]) < EPS) return;
    const t = (y - o[1]) / d[1];
    if (t <= 0) return;
    const p = at(t);
    if (p[0] * p[0] + p[2] * p[2] <= R_SHAPE * R_SHAPE) hits.push({ t, face });
  };

  if (shape === "cube") {
    for (const face of CUBE_FACES) {
      const { origin, n } = PLANES[face];
      const denom = dot(d, n);
      if (Math.abs(denom) < EPS) continue;
      const t = dot(sub(origin, o), n) / denom;
      if (t <= 0) continue;
      const [a, b] = paramsFrom(shape, face, at(t));
      if (a >= 0 && a <= 1 && b >= 0 && b <= 1) hits.push({ t, face });
    }
  } else if (shape === "sphere") {
    for (const t of quadratic(
      dot(d, d),
      2 * dot(o, d),
      dot(o, o) - R_SHAPE * R_SHAPE,
    )) {
      if (t > 0) hits.push({ t, face: "side" });
    }
  } else if (shape === "cylinder") {
    for (const t of quadratic(
      d[0] * d[0] + d[2] * d[2],
      2 * (o[0] * d[0] + o[2] * d[2]),
      o[0] * o[0] + o[2] * o[2] - R_SHAPE * R_SHAPE,
    )) {
      if (t <= 0) continue;
      const y = o[1] + t * d[1];
      if (y >= -0.5 && y <= 0.5) hits.push({ t, face: "side" });
    }
    cap(0.5, "py");
    cap(-0.5, "ny");
  } else {
    // x^2 + z^2 = ((0.5 - y) / 2)^2
    const A = d[0] * d[0] + d[2] * d[2] - 0.25 * d[1] * d[1];
    const B = 2 * (o[0] * d[0] + o[2] * d[2]) + 0.5 * d[1] * (0.5 - o[1]);
    const C = o[0] * o[0] + o[2] * o[2] - 0.25 * (0.5 - o[1]) * (0.5 - o[1]);
    for (const t of quadratic(A, B, C)) {
      if (t <= 0) continue;
      const y = o[1] + t * d[1];
      if (y >= -0.5 && y <= 0.5) hits.push({ t, face: "side" });
    }
    cap(-0.5, "ny");
  }

  if (hits.length === 0) return null;
  return hits.reduce((best, h) => (h.t < best.t ? h : best));
}

/* ---------- tessellation ---------- */

type Quad = { pts: V3[]; fill: string; depth: number };

function faceQuads(
  shape: Shape,
  face: Face,
  resA: number,
  resB: number,
  cam: Cam,
): Quad[] {
  const [light, dark] = PALETTE[face];
  const quads: Quad[] = [];
  for (let i = 0; i < resA; i++) {
    for (let j = 0; j < resB; j++) {
      const a0 = i / resA;
      const a1 = (i + 1) / resA;
      const b0 = j / resB;
      const b1 = (j + 1) / resB;
      const center = pointFrom(shape, face, (a0 + a1) / 2, (b0 + b1) / 2);
      const n = normalAt(shape, face, center);
      if (dot(n, cam.eye) <= 0) continue;
      const cell =
        (Math.floor(((a0 + a1) / 2) * CELLS) +
          Math.floor(((b0 + b1) / 2) * CELLS)) %
        2;
      const lambert = 0.6 + 0.4 * Math.max(0, dot(n, LIGHT));
      quads.push({
        pts: [
          pointFrom(shape, face, a0, b0),
          pointFrom(shape, face, a1, b0),
          pointFrom(shape, face, a1, b1),
          pointFrom(shape, face, a0, b1),
        ],
        fill: shade(cell === 0 ? light : dark, lambert),
        depth: dot(center, cam.eye),
      });
    }
  }
  return quads;
}

function faceOutline(shape: Shape, face: Face): V3[] {
  return [
    pointFrom(shape, face, 0, 0),
    pointFrom(shape, face, 1, 0),
    pointFrom(shape, face, 1, 1),
    pointFrom(shape, face, 0, 1),
  ];
}

function rimPoints(y: number): V3[] {
  const pts: V3[] = [];
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * TAU;
    pts.push([R_SHAPE * Math.cos(t), y, R_SHAPE * Math.sin(t)]);
  }
  return pts;
}

// Split a sampled curve into the stretches that face the camera, so the grid
// is only drawn on the visible half of the shape.
function visibleRuns(shape: Shape, pts: V3[], cam: Cam): V3[][] {
  const runs: V3[][] = [];
  let run: V3[] = [];
  for (const p of pts) {
    if (dot(normalAt(shape, "side", p), cam.eye) > 0) {
      run.push(p);
    } else {
      if (run.length > 1) runs.push(run);
      run = [];
    }
  }
  if (run.length > 1) runs.push(run);
  return runs;
}

// The lines of constant u and constant v on the curved part of the shape, at
// the same spacing as the checkerboard cells.
function sideGridRuns(shape: Shape, cam: Cam): V3[][] {
  const runs: V3[][] = [];
  const bSteps = shape === "sphere" ? 48 : 16;
  const aSteps = 96;
  // Constant u. Skipping k = 0 leaves that meridian to the seam line.
  for (let k = 1; k < CELLS; k++) {
    const pts = Array.from({ length: bSteps + 1 }, (_, i) =>
      pointFrom(shape, "side", k / CELLS, i / bSteps),
    );
    runs.push(...visibleRuns(shape, pts, cam));
  }
  // Constant v. The ends are the rims, poles, or apex, all drawn elsewhere.
  for (let k = 1; k < CELLS; k++) {
    const pts = Array.from({ length: aSteps + 1 }, (_, i) =>
      pointFrom(shape, "side", i / aSteps, k / CELLS),
    );
    runs.push(...visibleRuns(shape, pts, cam));
  }
  return runs;
}

function planeGridLines(shape: Shape, face: Face): [V3, V3][] {
  const lines: [V3, V3][] = [];
  for (let k = 0; k <= CELLS; k++) {
    const t = k / CELLS;
    lines.push([pointFrom(shape, face, t, 0), pointFrom(shape, face, t, 1)]);
    lines.push([pointFrom(shape, face, 0, t), pointFrom(shape, face, 1, t)]);
  }
  return lines;
}

// The seam is the theta = 0 meridian, where u wraps from 1 back around to 0.
// Only the front-facing stretch of it is drawn.
function seamSegments(shape: Shape, cam: Cam): [V3, V3][] {
  const steps = 40;
  const segs: [V3, V3][] = [];
  for (let i = 0; i < steps; i++) {
    const p0 = pointFrom(shape, "side", 0, i / steps);
    const p1 = pointFrom(shape, "side", 0, (i + 1) / steps);
    const mid = pointFrom(shape, "side", 0, (i + 0.5) / steps);
    if (dot(normalAt(shape, "side", mid), cam.eye) > 0) segs.push([p0, p1]);
  }
  return segs;
}

/* ---------- UV panel geometry ---------- */

const UV_W = 168;
const UV_H = 156;
const SQ = 110;
const OX = 36;
const OY = 22;
const AX = OX - 8;
const AY = OY + SQ + 8;
const TICKS = [0, 0.5, 1];

function toSq(u: number, v: number): [number, number] {
  return [OX + u * SQ, OY + (1 - v) * SQ];
}

/* ---------- component ---------- */

const START: Record<Shape, { face: Face; a: number; b: number }> = {
  cube: { face: "pz", a: 0.65, b: 0.6 },
  cylinder: { face: "side", a: 0.85, b: 0.65 },
  cone: { face: "side", a: 0.85, b: 0.65 },
  sphere: { face: "side", a: 0.85, b: 0.68 },
};

const ROWS: Record<Shape, number> = {
  cube: 3,
  cylinder: 4,
  cone: 4,
  sphere: 5,
};

export function UVMappingDemo({ shape }: { shape: Shape }) {
  const uid = useId().replace(/:/g, "");
  const shapeRef = useRef<SVGSVGElement>(null);
  const uvRef = useRef<SVGSVGElement>(null);
  const [back, setBack] = useState(false);
  const [state, setState] = useState(START[shape]);

  const cam = useMemo(() => viewOf(shape, back), [shape, back]);

  const surface = useMemo(() => {
    // The curved part is one depth-sorted sheet; each flat face is its own
    // group, clipped to its outline so a round cap stays round.
    const side = faceQuads(shape, "side", 40, shape === "sphere" ? 24 : 8, cam);
    side.sort((x, y) => x.depth - y.depth);

    const flat: { face: Face; quads: Quad[]; outline: V3[] }[] = [];
    const addFlat = (face: Face, outline: V3[]) => {
      const quads = faceQuads(shape, face, CELLS, CELLS, cam);
      if (quads.length > 0) flat.push({ face, quads, outline });
    };
    if (shape === "cube") {
      for (const face of CUBE_FACES) addFlat(face, faceOutline(shape, face));
    } else if (shape === "cylinder") {
      addFlat("py", rimPoints(0.5));
      addFlat("ny", rimPoints(-0.5));
    } else if (shape === "cone") {
      addFlat("ny", rimPoints(-0.5));
    }

    return (
      <g>
        <defs>
          {flat.map((f) => (
            <clipPath key={f.face} id={`${uid}-${f.face}`}>
              <polygon points={pointsAttr(cam, f.outline)} />
            </clipPath>
          ))}
        </defs>
        {side.map((q, i) => (
          <polygon
            key={`q${i}`}
            points={pointsAttr(cam, q.pts)}
            fill={q.fill}
            stroke={q.fill}
            strokeWidth={0.6}
          />
        ))}
        {shape !== "cube" &&
          sideGridRuns(shape, cam).map((run, i) => (
            <polyline
              key={`g${i}`}
              points={pointsAttr(cam, run)}
              fill="none"
              stroke={GRID}
              strokeOpacity={0.4}
              strokeWidth={0.7}
            />
          ))}
        {flat.map((f) => (
          <g key={f.face} clipPath={`url(#${uid}-${f.face})`}>
            {f.quads.map((q, i) => (
              <polygon
                key={`fq${i}`}
                points={pointsAttr(cam, q.pts)}
                fill={q.fill}
                stroke={q.fill}
                strokeWidth={0.6}
              />
            ))}
            {planeGridLines(shape, f.face).map((seg, i) => {
              const [x1, y1] = project(cam, seg[0]);
              const [x2, y2] = project(cam, seg[1]);
              return (
                <line
                  key={`fg${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={GRID}
                  strokeOpacity={0.4}
                  strokeWidth={0.7}
                />
              );
            })}
          </g>
        ))}
        {flat.map((f) => (
          <polygon
            key={`o${f.face}`}
            points={pointsAttr(cam, f.outline)}
            fill="none"
            stroke="#5c7e92"
            strokeWidth={0.9}
          />
        ))}
        {shape !== "cube" &&
          seamSegments(shape, cam).map((seg, i) => {
            const [x1, y1] = project(cam, seg[0]);
            const [x2, y2] = project(cam, seg[1]);
            return (
              <line
                key={`m${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={MARKER}
                strokeWidth={1.6}
              />
            );
          })}
      </g>
    );
  }, [shape, uid, cam]);

  const point = pointFrom(shape, state.face, state.a, state.b);
  const readout = uvFrom(shape, state.face, point);
  const [mx, my] = project(cam, point);
  const [ux, uy] = toSq(readout.u, readout.v);
  const uvPalette = PALETTE[state.face];
  const isCap = shape !== "cube" && state.face !== "side";

  // Dragging in the UV square can land the point on the far side of the shape.
  // When it does, the marker is drawn underneath and the shape is faded, so
  // it reads as being around the back instead of floating in front.
  const inFront = dot(normalAt(shape, state.face, point), cam.eye) > 0;

  const marker = (
    <>
      <circle cx={mx} cy={my} r={5.5} fill="#ffffff" opacity={0.9} />
      <circle
        cx={mx}
        cy={my}
        r={4}
        fill={MARKER}
        stroke="#ffffff"
        strokeWidth={1.2}
      />
    </>
  );

  // Cast a ray through the cursor and keep the nearest point on the surface.
  const pickShape = (clientX: number, clientY: number) => {
    const svg = shapeRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * VIEW;
    const sy = ((clientY - rect.top) / rect.height) * VIEW;
    const px = (sx - CX) / cam.scale;
    const py = (CY - sy) / cam.scale;
    const o: V3 = [
      cam.right[0] * px + cam.up[0] * py + cam.eye[0] * 10,
      cam.right[1] * px + cam.up[1] * py + cam.eye[1] * 10,
      cam.right[2] * px + cam.up[2] * py + cam.eye[2] * 10,
    ];
    const d: V3 = [-cam.eye[0], -cam.eye[1], -cam.eye[2]];
    const hit = intersect(shape, o, d);
    if (!hit) return;
    const p: V3 = [
      o[0] + hit.t * d[0],
      o[1] + hit.t * d[1],
      o[2] + hit.t * d[2],
    ];
    const [a, b] = paramsFrom(shape, hit.face, p);
    setState({ face: hit.face, a: clamp01(a), b: clamp01(b) });
  };

  // Dragging in the UV square runs the mapping backwards, onto whichever face
  // the point is already on.
  const pickUV = (clientX: number, clientY: number) => {
    const svg = uvRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * UV_W;
    const sy = ((clientY - rect.top) / rect.height) * UV_H;
    let a = clamp01((sx - OX) / SQ);
    let b = clamp01(1 - (sy - OY) / SQ);
    if (isCap) {
      // The corners of the square fall off the cap, so snap back to its rim.
      const r = Math.hypot(a - 0.5, b - 0.5);
      if (r > 0.5) {
        a = 0.5 + ((a - 0.5) * 0.5) / r;
        b = 0.5 + ((b - 0.5) * 0.5) / r;
      }
    }
    setState({ face: state.face, a, b });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = 0.02;
    let { a, b } = state;
    if (e.key === "ArrowLeft") a -= step;
    else if (e.key === "ArrowRight") a += step;
    else if (e.key === "ArrowDown") b -= step;
    else if (e.key === "ArrowUp") b += step;
    else return;
    e.preventDefault();
    if (state.face === "side") {
      a = (a + 1) % 1;
      b = clamp01(b);
    } else {
      a = clamp01(a);
      b = clamp01(b);
      if (isCap && Math.hypot(a - 0.5, b - 0.5) > 0.5) return;
    }
    setState({ face: state.face, a, b });
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

  // Every region prints a different number of lines, so pad to the tallest to
  // keep the rows below from jumping as the point moves.
  const rows: ([string, string] | null)[] = [...readout.lines];
  while (rows.length < ROWS[shape]) rows.push(null);

  return (
    <div className="relative my-4 border border-neutral-200 bg-neutral-50 p-2">
      <button
        type="button"
        onClick={() => setBack((x) => !x)}
        className="absolute left-2 top-2 z-10 flex items-center gap-1 border border-neutral-200 bg-white/80 px-1.5 py-0.5 text-[11px] text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        aria-label="Turn the shape around to see the other side"
        title="Turn the shape around"
      >
        <RotateCcw className="size-3" />
        turn around
      </button>

      <div className="mx-auto flex w-fit flex-col items-center gap-1 sm:flex-row sm:gap-6">
        <svg
          ref={shapeRef}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="block h-auto w-[210px] cursor-grab touch-none select-none active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          tabIndex={0}
          role="img"
          aria-label={`A ${shape} with a draggable point, showing the UV coordinate of that point`}
          onKeyDown={onKeyDown}
          {...drag(pickShape)}
        >
          {!inFront && marker}
          <g opacity={inFront ? 1 : 0.45}>{surface}</g>
          {inFront && marker}
        </svg>

        <svg
          ref={uvRef}
          viewBox={`0 0 ${UV_W} ${UV_H}`}
          className="block h-auto w-[168px] cursor-crosshair touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          tabIndex={0}
          role="img"
          aria-label={`The UV square, with a draggable point at u ${fmt(readout.u)}, v ${fmt(readout.v)}`}
          onKeyDown={onKeyDown}
          {...drag(pickUV)}
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
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
            </marker>
          </defs>

          {Array.from({ length: CELLS * CELLS }, (_, i) => {
            const cu = i % CELLS;
            const cv = Math.floor(i / CELLS);
            const [x, y] = toSq(cu / CELLS, (cv + 1) / CELLS);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={SQ / CELLS}
                height={SQ / CELLS}
                fill={uvPalette[(cu + cv) % 2]}
              />
            );
          })}
          {Array.from({ length: CELLS + 1 }, (_, k) => (
            <g
              key={`g${k}`}
              stroke={GRID}
              strokeOpacity={0.4}
              strokeWidth={0.7}
            >
              <line
                x1={OX + (k * SQ) / CELLS}
                y1={OY}
                x2={OX + (k * SQ) / CELLS}
                y2={OY + SQ}
              />
              <line
                x1={OX}
                y1={OY + (k * SQ) / CELLS}
                x2={OX + SQ}
                y2={OY + (k * SQ) / CELLS}
              />
            </g>
          ))}

          {isCap && (
            <circle
              cx={OX + SQ / 2}
              cy={OY + SQ / 2}
              r={SQ / 2}
              fill="none"
              stroke="#5c7e92"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {state.face === "side" && (
            <>
              <line
                x1={OX}
                y1={OY}
                x2={OX}
                y2={OY + SQ}
                stroke={MARKER}
                strokeWidth={1.6}
              />
              <line
                x1={OX + SQ}
                y1={OY}
                x2={OX + SQ}
                y2={OY + SQ}
                stroke={MARKER}
                strokeWidth={1.6}
              />
            </>
          )}

          <circle cx={ux} cy={uy} r={5.5} fill="#ffffff" opacity={0.9} />
          <circle
            cx={ux}
            cy={uy}
            r={4}
            fill={MARKER}
            stroke="#ffffff"
            strokeWidth={1.2}
          />

          <g stroke="#6b7280" strokeWidth={1}>
            <line
              x1={AX}
              y1={AY}
              x2={OX + SQ + 10}
              y2={AY}
              markerEnd={`url(#${uid}-ax)`}
            />
            <line
              x1={AX}
              y1={AY}
              x2={AX}
              y2={OY - 10}
              markerEnd={`url(#${uid}-ax)`}
            />
            {TICKS.map((t) => (
              <line
                key={`tu${t}`}
                x1={OX + t * SQ}
                y1={AY - 3}
                x2={OX + t * SQ}
                y2={AY + 3}
              />
            ))}
            {TICKS.map((t) => (
              <line
                key={`tv${t}`}
                x1={AX - 3}
                y1={OY + (1 - t) * SQ}
                x2={AX + 3}
                y2={OY + (1 - t) * SQ}
              />
            ))}
          </g>
          <g fontSize={8.5} fill="#6b7280">
            {TICKS.map((t) => (
              <text
                key={`lu${t}`}
                x={OX + t * SQ}
                y={AY + 12}
                textAnchor="middle"
              >
                {t}
              </text>
            ))}
            {TICKS.map((t) => (
              <text
                key={`lv${t}`}
                x={AX - 6}
                y={OY + (1 - t) * SQ + 3}
                textAnchor="end"
              >
                {t}
              </text>
            ))}
            <text x={OX + SQ + 17} y={AY + 3} textAnchor="middle" fontSize={10}>
              u
            </text>
            <text x={AX} y={OY - 15} textAnchor="middle" fontSize={10}>
              v
            </text>
          </g>
        </svg>
      </div>

      <div className="mx-auto mt-1 flex w-fit flex-col gap-0.5 px-1 font-mono text-xs text-neutral-700">
        {rows.map((row, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="w-[11.5rem] shrink-0 whitespace-pre">
              {row ? row[0] : " "}
            </span>
            <span className="whitespace-pre text-neutral-900">
              {row ? row[1] : ""}
            </span>
          </div>
        ))}
        <div className="mt-0.5 flex items-baseline gap-2 font-semibold text-blue-slate-800">
          <span className="w-[11.5rem] shrink-0 whitespace-pre">(u, v)</span>
          <span className="whitespace-pre">
            ({fmt(readout.u)}, {fmt(readout.v)})
          </span>
        </div>
      </div>
    </div>
  );
}
