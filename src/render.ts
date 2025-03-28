import { assert, never } from "./assert";
import { MoveWithTrail, State } from "./state";
import { Vec2 } from "./vec2";

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
const hitsSpan = document.querySelector<HTMLSpanElement>("#hits")!;
assert(!!hitsSpan, "hits span not found");
const rollsSpan = document.querySelector<HTMLSpanElement>("#rolls")!;
assert(!!rollsSpan, "rolls span not found");

export function updateText(state: State): void {
  const {
    config: { seed },
    level: { h, w },
    roll,
    hits,
    rolls,
  } = state;

  seedSpan.innerText = seed + "";
  widthSpan.innerText = w + "";
  heightSpan.innerText = h + "";
  rollSpan.innerText = roll + "";
  hitsSpan.innerText = hits + "";
  rollsSpan.innerText = rolls + "";
}

export type TriangleVertex = {
  angle: number;
  size: number;
};

export type TriangleConfig = {
  v1: TriangleVertex;
  v2: TriangleVertex;
  v3: TriangleVertex;
  offset?: Vec2;
  color: string;
  angle?: number;
};

export function renderTriangle(
  state: State,
  pos: Vec2,
  config: TriangleConfig
): void {
  const { v1, v2, v3, offset, color, angle = 0 } = config;
  const {
    ctx,
    config: { tileSize },
  } = state;

  const center = pos.centerIntTileCopy(tileSize);
  offset && center.add(offset);

  ctx.beginPath();

  ctx.moveTo(
    center.x + Math.cos(angle + v1.angle) * v1.size,
    center.y + Math.sin(angle + v1.angle) * v1.size
  );
  ctx.lineTo(
    center.x + Math.cos(angle + v2.angle) * v2.size,
    center.y + Math.sin(angle + v2.angle) * v2.size
  );
  ctx.lineTo(
    center.x + Math.cos(angle + v3.angle) * v3.size,
    center.y + Math.sin(angle + v3.angle) * v3.size
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
  pos: Vec2,
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

  const center = pos.centerIntTileCopy(tileSize);

  ctx.beginPath();
  ctx.arc(
    center.x,
    center.y,
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

function renderTrail(state: State, move: MoveWithTrail): void {
  const {
    ctx,
    config: { tileSize },
  } = state;
  const { trail } = move;

  const color = "blue";

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = tileSize * 0.05;

  for (let i = 0; i < trail.length; i++) {
    const current = trail[i];
    const next = trail[i + 1];

    if (!next) {
      const previous = trail[i - 1];
      if (!previous) {
        return;
      }

      const offset = current.subtractCopy(previous);
      const size = tileSize * 0.3;
      renderTriangle(state, current, {
        v1: { angle: 0, size: 0 },
        v2: { angle: (-5 * Math.PI) / 6, size },
        v3: { angle: (5 * Math.PI) / 6, size },
        angle: Math.atan2(offset.y, offset.x),
        color,
      });
      return;
    }
    const centeredCurrent = current.centerIntTileCopy(tileSize);
    const centeredNext = next.centerIntTileCopy(tileSize);

    ctx.moveTo(centeredCurrent.x, centeredCurrent.y);
    ctx.lineTo(centeredNext.x, centeredNext.y);
    ctx.stroke();
  }
}

function renderValidMove(state: State, move: MoveWithTrail): void {
  const { hoveredTile } = state;

  renderCircle(state, move.pos, {
    radiusRatio: 0.5,
    strokeColor: "rgba(0, 0, 255, .5)",
    strokeRatio: 0.1,
  });

  if (hoveredTile?.equals(move.pos)) {
    renderTrail(state, move);
  }
}

function renderInvalidMove(state: State, pos: Vec2): void {
  renderCircle(state, pos, {
    radiusRatio: 0.4,
    color: "rgba(255, 0, 0, .7)",
  });
}

function renderMoves(state: State): void {
  for (const validMove of state.validMoves) {
    renderValidMove(state, validMove);
  }
  for (const invalidMove of state.invalidMoves) {
    renderInvalidMove(state, invalidMove);
  }
}

function renderHoveredTile(state: State): void {
  const { hoveredTile, validMoves, invalidMoves } = state;

  if (!hoveredTile) {
    return;
  }

  if (validMoves.find((vm) => vm.pos.equals(hoveredTile))) {
    renderCircle(state, hoveredTile, {
      radiusRatio: 0.5,
      strokeColor: "rgba(0, 0, 255)",
      strokeRatio: 0.1,
    });
    return;
  } else if (invalidMoves.find((im) => im.equals(hoveredTile))) {
    renderCircle(state, hoveredTile, {
      radiusRatio: 0.5,
      strokeColor: "rgba(255, 0, 0)",
      strokeRatio: 0.1,
    });
    return;
  }
  renderCircle(state, hoveredTile, {
    radiusRatio: 0.5,
    strokeColor: "rgba(255, 0, 0, .5)",
    strokeRatio: 0.1,
  });
}

function renderWin(state: State): void {
  const { ctx, isWin } = state;
  const { canvas } = ctx;

  if (!isWin) {
    return;
  }

  // TODO: render win text
}

export function render(state: State): void {
  const { ctx } = state;

  updateText(state);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  renderTiles(state);
  renderHole(state);
  renderBall(state);
  renderMoves(state);
  renderHoveredTile(state);
  renderWin(state);
}
