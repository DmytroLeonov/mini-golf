import { Current, State } from "./state";
import { Coord } from "./types";

export type CanvasEvent = (state: State, pos: Coord) => void;
export type CanvasClickEvent = CanvasEvent;
export type CanvasHoverEvent = CanvasEvent;

type MouseEventType = "click" | "mousemove" | "mouseleave" | "mouseenter";

export function registerMouseEvent(
  state: State,
  eventType: MouseEventType,
  e: CanvasClickEvent,
  when?: Current[]
): void {
  state.canvas.addEventListener(eventType, (mouseEvent) => {
    if (when && !when.includes(state.current)) {
      return;
    }

    const pos = getTilePositionFromMouseEvent(state, mouseEvent);
    e(state, pos);
  });
}

function getTilePositionFromMouseEvent(state: State, e: MouseEvent): Coord {
  const {
    canvas,
    config: { tileSize },
    level: { w, h },
  } = state;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

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
  state.canvas.style.cursor = "pointer";
}

export function mouseMove(state: State, pos: Coord): void {
  state.hoveredTile = pos;
  // console.log(pos);
}

export function mouseLeave(state: State): void {
  state.hoveredTile = null;
  state.canvas.style.cursor = "default";
}
