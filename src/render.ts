import { assert, never } from "./assert";
import { State } from "./state";
import { Coord } from "./types";

type CircleProportionalConfig = {
  color?: string;
  radiusRatio: number;
  strokeRatio?: number;
  strokeColor?: string;
};

const seedSpan = document.querySelector<HTMLSpanElement>("#seed")!;
assert(!!seedSpan, "seed span not found");
const widthSpan = document.querySelector<HTMLSpanElement>("#width")!;
assert(!!widthSpan, "width span not found");
const heightSpan = document.querySelector<HTMLSpanElement>("#height")!;
assert(!!heightSpan, "height span not found");
const rollSpan = document.querySelector<HTMLSpanElement>("#roll")!;
assert(!!rollSpan, "roll span not found");

export function setText(state: State): void {
  const {
    config: { seed },
    level: { h, w },
    roll,
  } = state;
  seedSpan.innerText = seed + "";
  widthSpan.innerText = w + "";
  heightSpan.innerText = h + "";
  rollSpan.innerText = roll + "";
}

export type TriangleVertex = {
  angle: number;
  size: number;
};

export type TriangleConfig = {
  v1: TriangleVertex;
  v2: TriangleVertex;
  v3: TriangleVertex;
  offset?: Coord;
  color: string;
  angle?: number;
};

export function renderTriangle(
  state: State,
  pos: Coord,
  config: TriangleConfig
): void {
  const { v1, v2, v3, offset, color, angle = 0 } = config;
  const {
    ctx,
    config: { tileSize },
  } = state;

  const x = pos.x * tileSize + tileSize / 2 + (offset?.x ?? 0);
  const y = pos.y * tileSize + tileSize / 2 + (offset?.y ?? 0);

  ctx.beginPath();

  ctx.moveTo(
    x + Math.cos(angle + v1.angle) * v1.size,
    y + Math.sin(angle + v1.angle) * v1.size
  );
  ctx.lineTo(
    x + Math.cos(angle + v2.angle) * v2.size,
    y + Math.sin(angle + v2.angle) * v2.size
  );
  ctx.lineTo(
    x + Math.cos(angle + v3.angle) * v3.size,
    y + Math.sin(angle + v3.angle) * v3.size
  );
  ctx.closePath();
  ctx.fillStyle = color;

  ctx.closePath();
  ctx.fill();
}

function renderBall(state: State): void {
  const { ball } = state;

  renderCircle(state, ball, {
    color: "white",
    radiusRatio: 0.3,
    strokeColor: "black",
    strokeRatio: 0.1,
  });
}

function renderHole(state: State): void {
  const {
    level: { hole },
  } = state;

  renderCircle(state, hole, { color: "black", radiusRatio: 0.4 });
}

function renderTiles(state: State): void {
  for (const row of state.level.field) {
    for (const tile of row) {
      tile.render(state);
    }
  }
}

function renderCircle(
  state: State,
  pos: Coord,
  config: CircleProportionalConfig
): void {
  const {
    ctx,
    config: { tileSize },
  } = state;
  const { color, radiusRatio, strokeRatio, strokeColor } = config;

  if (!!strokeRatio !== !!strokeColor) {
    never("either supply both strokeColor and strokeRatio or none");
  }

  ctx.beginPath();
  ctx.arc(
    pos.x * tileSize + tileSize / 2,
    pos.y * tileSize + tileSize / 2,
    tileSize * (radiusRatio - (strokeRatio ?? 0) / 2),
    0,
    2 * Math.PI
  );

  if (color) {
    ctx.fillStyle = color;
    ctx.fill();
  }

  if (strokeRatio && strokeColor) {
    ctx.lineWidth = tileSize * strokeRatio;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }
}

function renderPossibleMove(state: State, pos: Coord): void {
  renderCircle(state, pos, {
    radiusRatio: 0.5,
    strokeColor: "rgba(0, 0, 255, .5)",
    strokeRatio: 0.1,
  });
}

function renderPossibleMoves(state: State): void {
  for (const possibleMove of state.possibleMoves) {
    renderPossibleMove(state, possibleMove);
  }
}

function renderHoveredTile(state: State): void {
  const { hoveredTile } = state;

  if (!hoveredTile) {
    return;
  }

  renderCircle(state, hoveredTile, {
    radiusRatio: 0.5,
    strokeColor: "rgba(255, 0, 0, .5)",
    strokeRatio: 0.1,
  });
}

export function render(state: State): void {
  const { ctx } = state;

  setText(state);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  renderTiles(state);
  renderBall(state);
  renderHole(state);
  renderPossibleMoves(state);
  renderHoveredTile(state);
}
