import { assert } from "./assert";
import { Current, State } from "./state";
import { Coord } from "./types";

export type CanvasMouseEventCallback = (state: State, pos: Coord) => void;

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

function getTilePositionFromMouseEvent(state: State, e: MouseEvent): Coord {
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

  const x = Math.max(Math.min(Math.floor(localX / tileSize), w - 1), 0);
  const y = Math.max(Math.min(Math.floor(localY / tileSize), h - 1), 0);

  return { x, y };
}

export function canvasClick(state: State, pos: Coord): void {
  console.log(state, pos);
  state.current = "rolling";
}

export function mouseMove(state: State, pos: Coord): void {
  state.hoveredTile = pos;
  for (const validMove of state.validMoves) {
    if (pos.x === validMove.x && pos.y === validMove.y) {
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

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
];

export function updateMoves(state: State): void {
  const {
    ball,
    roll,
    level: { field, w, h },
  } = state;

  const validMoves: Coord[] = [];
  const invalidMoves: Coord[] = [];

  outer: for (const [x, y] of directions) {
    const endPos: Coord = {
      x: ball.x + x * roll,
      y: ball.y + y * roll,
    };

    if (endPos.x < 0 || endPos.x >= w || endPos.y < 0 || endPos.y >= h) {
      continue;
    }

    // TODO: follow slopes
    for (let i = 1; i <= roll; i++) {
      const tile = field[ball.y + y * i][ball.x + x * i];
      if (!tile.canHitOver(state)) {
        invalidMoves.push(endPos);
        continue outer;
      }
    }
    validMoves.push(endPos);
  }

  state.validMoves = validMoves;
  state.invalidMoves = invalidMoves;
}

export function registerRollEvent(state: State): void {
  const rerollButton = document.querySelector<HTMLSpanElement>("#reroll")!;
  assert(!!rerollButton, "rerollButton not found");

  rerollButton.addEventListener("click", () => {
    if (state.current !== "rolling") {
      return;
    }

    state.roll = state.rand.randRange(1, 7);
    state.current = "hitting";
    updateMoves(state);
  });
}
