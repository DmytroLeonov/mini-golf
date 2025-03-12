import { Current, State } from "./state";
import { Coord } from "./types";

export type CanvasClickEvent = (state: State, pos: Coord) => void;

export function registerEvent(
  state: State,
  e: CanvasClickEvent,
  when: Current[]
): void {
  state.canvas.addEventListener("click", (mouseEvent) => {
    if (!when.includes(state.current)) {
      return;
    }

    const pos = getClickTilePosition(state, mouseEvent);
    e(state, pos);
  });
}

function getClickTilePosition(state: State, e: MouseEvent): Coord {
  const {
    canvas,
    config: { tileSize },
  } = state;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const localX = (e.clientX - rect.left) * scaleX;
  const localY = (e.clientY - rect.top) * scaleY;

  const x = Math.floor(localX / tileSize);
  const y = Math.floor(localY / tileSize);

  return { x, y };
}

export function canvasClick(state: State, pos: Coord): void {
  console.log(pos);
}
