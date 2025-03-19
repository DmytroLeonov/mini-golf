import { assert } from "./assert";
import { createRandomLevel, Level } from "./level";
import { resetCanvas } from "./main";
import { MoveWithTrail, State } from "./state";
import { Vec2 } from "./vec2";

export type CanvasMouseEventCallback = (state: State, pos: Vec2) => void;

export type MouseEventType = "click" | "mousemove" | "mouseleave";

type MovesForPower = {
  validMoves: MoveWithTrail[];
  invalidMoves: Vec2[];
};

export function registerMouseEvent(
  state: State,
  eventType: MouseEventType,
  cb: CanvasMouseEventCallback
): void {
  state.ctx.canvas.addEventListener(eventType, (mouseEvent) => {
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
  const { validMoves, ball } = state;

  const move = validMoves.find((vm) => vm.pos.equals(pos));
  if (move) {
    const newPos = move.trail.at(-1) ?? move.pos;
    ball.set(newPos);
    state.hits++;
    state.validMoves = [];
    state.invalidMoves = [];
  }
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

function tryFallOnOvershoot(state: State, move: MoveWithTrail): boolean {
  const {
    ball,
    level: { hole },
  } = state;
  const { pos, trail } = move;

  const diff = pos.subtractCopy(ball);
  diff.x = Math.sign(diff.x);
  diff.y = Math.sign(diff.y);

  if (hole.equals(pos.subtractCopy(diff))) {
    trail.push(pos.copy(), hole.copy());
    return true;
  }

  return false;
}

function calculateTrail(state: State, move: MoveWithTrail): void {
  const {
    level: { field },
  } = state;
  const { pos, trail } = move;

  let currentTile = field[pos.y][pos.x];
  assert(
    currentTile.canLand(),
    "trying to calculate trail for an unlandable tile",
    "tile",
    currentTile,
    "move",
    move
  );
  assert(move.trail.length === 0, "trail already exists");

  const fell = tryFallOnOvershoot(state, move);
  if (fell) {
    return;
  }

  if (!currentTile.slope) {
    return;
  }

  while (
    currentTile.canLand() &&
    !trail.find((p) => p.equals(currentTile.pos))
  ) {
    trail.push(currentTile.pos.copy());

    const slope = currentTile.slope;
    if (!slope) {
      break;
    }

    const nextTilePos = currentTile.pos.addCopy(slope);
    const nextTile = field[nextTilePos.y]?.[nextTilePos.x];
    if (!nextTile) {
      break;
    }

    currentTile = nextTile;
  }
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

function getMovesForPower(state: State, power: number): MovesForPower {
  const {
    ball,
    level: { field, w, h },
  } = state;

  const validMoves: MoveWithTrail[] = [];
  const invalidMoves: Vec2[] = [];

  outer: for (const dir of directions) {
    const endPos = ball.addComponentsCopy(dir.x * power, dir.y * power);

    if (endPos.x < 0 || endPos.x >= w || endPos.y < 0 || endPos.y >= h) {
      continue;
    }

    if (!field[endPos.y][endPos.x].canLand()) {
      invalidMoves.push(endPos);
      continue outer;
    }

    for (let i = 1; i <= power; i++) {
      const tile = field[ball.y + dir.y * i][ball.x + dir.x * i];
      if (!tile.canHitOver(state)) {
        invalidMoves.push(endPos);
        continue outer;
      }
    }
    validMoves.push({ pos: endPos, trail: [] });
  }

  for (const validMove of validMoves) {
    calculateTrail(state, validMove);
  }

  return {
    validMoves,
    invalidMoves,
  };
}

function updateMoves(state: State): void {
  const {
    roll,
    level: { field },
    ball,
  } = state;

  const validMoves: MoveWithTrail[] = [];
  const invalidMoves: Vec2[] = [];

  const tile = field[ball.y][ball.x];
  const power = Math.max(roll + tile.getRollModifier(), 1);

  const actual = getMovesForPower(state, power);
  validMoves.push(...actual.validMoves);
  invalidMoves.push(...actual.invalidMoves);

  if (power !== 1) {
    // Can always put
    const put = getMovesForPower(state, 1);
    validMoves.push(...put.validMoves);
    invalidMoves.push(...put.invalidMoves);
  }

  state.validMoves = validMoves;
  state.invalidMoves = invalidMoves;
}

export function registerRollEvent(state: State): void {
  const rerollButton = document.querySelector<HTMLSpanElement>("#reroll")!;
  assert(!!rerollButton, "reroll button not found");

  function roll() {
    state.roll = state.rand.randRange(1, 7);
    state.rolls++;
    updateMoves(state);
  }

  rerollButton.addEventListener("click", () => {
    roll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "r") {
      roll();
    }
  });
}

export function registerRandomizeLevelEvent(state: State): void {
  const randomizeButton =
    document.querySelector<HTMLSpanElement>("#randomize")!;
  assert(!!randomizeButton, "randomize button not found");

  randomizeButton.addEventListener("click", () => {
    randomizeLevel(state);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "e") {
      randomizeLevel(state);
    }
  });
}

export function changeLevel(state: State, level: Level): void {
  state.level = level;
  state.ball = level.tee;
  state.invalidMoves = [];
  state.validMoves = [];
  state.roll = 0;
  state.rolls = 0;
  state.hits = 0;
  resetCanvas(state);
}

export function randomizeLevel(state: State): void {
  const { seededRand } = state;
  const newLevel = createRandomLevel(seededRand);
  changeLevel(state, newLevel);
}
