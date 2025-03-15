import { assert } from "./assert";
import { Current, MoveWithTrail, State } from "./state";
import { Vec2 } from "./vec2";

export type CanvasMouseEventCallback = (state: State, pos: Vec2) => void;

export type MouseEventType = "click" | "mousemove" | "mouseleave";

export function registerMouseEvent(
  state: State,
  eventType: MouseEventType,
  cb: CanvasMouseEventCallback,
  when?: Current[]
): void {
  state.ctx.canvas.addEventListener(eventType, (mouseEvent) => {
    if (when && !when.includes(state.current)) {
      return;
    }

    const pos = getTilePositionFromMouseEvent(state, mouseEvent);
    cb(state, pos);
  });
}

function getTilePositionFromMouseEvent(state: State, e: MouseEvent): Vec2 {
  const {
    ctx,
    config: { tileSize },
    level: { w, h },
  } = state;
  const rect = ctx.canvas.getBoundingClientRect();
  const scaleX = ctx.canvas.width / rect.width;
  const scaleY = ctx.canvas.height / rect.height;

  const localX = (e.clientX - rect.left) * scaleX;
  const localY = (e.clientY - rect.top) * scaleY;

  const tileX = Math.max(Math.min(Math.floor(localX / tileSize), w - 1), 0);
  const tileY = Math.max(Math.min(Math.floor(localY / tileSize), h - 1), 0);

  return new Vec2(tileX, tileY);
}

export function canvasClick(state: State, pos: Vec2): void {
  console.log(state, pos);
  state.current = "rolling";
}

export function mouseMove(state: State, pos: Vec2): void {
  state.hoveredTile = pos;
  for (const validMove of state.validMoves) {
    if (pos.equals(validMove.pos)) {
      state.ctx.canvas.style.cursor = "pointer";
      return;
    }
  }

  state.ctx.canvas.style.cursor = "default";
}

export function mouseLeave(state: State): void {
  state.hoveredTile = null;
  state.ctx.canvas.style.cursor = "default";
}

function calculateTrail(state: State, move: MoveWithTrail): void {
  const {
    level: { field },
  } = state;
  const { pos, trail } = move;

  let tile = field[pos.y][pos.x];
  assert(
    tile.canLand(),
    "trying to calculate trail for an unlandable tile",
    "tile",
    tile,
    "move",
    move
  );
  assert(move.trail.length === 0, "trail already exists");

  if (!tile.slope) {
    return;
  }

  // while (tile.canLand() && tile.slope) {
  //   const tilePos = tile.slope;
  //   trail.push(tile.pos.copy());
  // }
}

const directions = [
  new Vec2(-1, -1),
  new Vec2(0, -1),
  new Vec2(1, -1),
  new Vec2(1, 0),
  new Vec2(1, 1),
  new Vec2(0, 1),
  new Vec2(-1, 1),
  new Vec2(-1, 0),
];

function updateMoves(state: State): void {
  const {
    ball,
    roll,
    level: { field, w, h },
  } = state;

  const validMoves: MoveWithTrail[] = [];
  const invalidMoves: Vec2[] = [];

  outer: for (const dir of directions) {
    const endPos = ball.addComponentsCopy(dir.x * roll, dir.y * roll);

    if (endPos.x < 0 || endPos.x >= w || endPos.y < 0 || endPos.y >= h) {
      continue;
    }

    if (!field[endPos.y][endPos.x].canLand()) {
      invalidMoves.push(endPos);
      continue outer;
    }

    for (let i = 1; i <= roll; i++) {
      const tile = field[ball.y + dir.y * i][ball.x + dir.x * i];
      if (!tile.canHitOver(state)) {
        invalidMoves.push(endPos);
        continue outer;
      }
    }
    validMoves.push({ pos: endPos, trail: [] });
  }
  console.log(validMoves);

  for (const validMove of validMoves) {
    calculateTrail(state, validMove);
  }

  state.validMoves = validMoves;
  state.invalidMoves = invalidMoves;
}

export function registerRollEvent(state: State): void {
  const rerollButton = document.querySelector<HTMLSpanElement>("#reroll")!;
  assert(!!rerollButton, "reroll button not found");

  rerollButton.addEventListener("click", () => {
    if (state.current !== "rolling") {
      return;
    }

    state.roll = state.rand.randRange(1, 7);
    state.current = "hitting";
    updateMoves(state);
  });
}
