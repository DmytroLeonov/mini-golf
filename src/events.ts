import { State } from "./state";

export type Event = (state: State, e: MouseEvent) => void;

export function registerEvent(state: State, e: Event): void {
  state.canvas.addEventListener("click", (ev) => e(state, ev));
}

export function canvasClick(state: State, e: MouseEvent): void {
  console.log(state, e);
}