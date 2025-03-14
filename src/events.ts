import { Current, State } from "./state";
import { Coord } from "./types";

export type CanvasMouseEventCallback = (state: State, pos: Coord) => void;

export type MouseEventType =
  | "click"
  | "mousemove"
  | "mouseleave"
  | "mouseenter";

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
}

export function mouseEnter(state: State): void {
  state.ctx.canvas.style.cursor = "pointer";
}

export function mouseMove(state: State, pos: Coord): void {
  state.hoveredTile = pos;
  // console.log(pos);
}

export function mouseLeave(state: State): void {
  state.hoveredTile = null;
  state.ctx.canvas.style.cursor = "default";
}
