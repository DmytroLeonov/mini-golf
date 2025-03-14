import { assert } from "./assert";
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

export function setText(state: State): void {
  const {
    config: { seed },
    level: { h, w },
  } = state;
  seedSpan.innerText = seed + "";
  widthSpan.innerText = w + "";
  heightSpan.innerText = h + "";
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
    throw new Error("either supply both strokeColor and strokeRatio or none");
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

function renderDot(state: State, pos: Coord): void {
  renderCircle(state, pos, { color: "red", radiusRatio: 0.1 });
}

const offsets = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
];

function renderPossibleMoves(state: State): void {
  const ballPos = state.ball;

  for (const [x, y] of offsets) {
    const dotPos: Coord = {
      x: ballPos.x + x,
      y: ballPos.y + y,
    };
    renderDot(state, dotPos);
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

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  renderTiles(state);
  renderBall(state);
  renderHole(state);
  renderPossibleMoves(state);
  renderHoveredTile(state);
}
