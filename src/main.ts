import { assert } from "./assert";
import {
  canvasClick,
  mouseEnter,
  mouseLeave,
  mouseMove,
  registerMouseEvent,
} from "./events";
import { getGameConfig } from "./game-config";
import { createRandomLevel } from "./level";
import { render, setText } from "./render";
import { createGameState, State } from "./state";
import { createRand, getSeed, mulberry32 } from "./utils";

function setupCanvas(state: State): void {
  const { ctx } = state;
  ctx.imageSmoothingEnabled = false;
}

function resetCanvas(state: State): void {
  const {
    ctx,
    config: { tileSize },
    level,
  } = state;

  ctx.canvas.width = level.w * tileSize;
  ctx.canvas.height = level.h * tileSize;
}

function gameLoop(state: State): void {
  const {
    config: { targetFps },
  } = state;
  const frameIntervalMs = 1000 / targetFps;

  let previousTimeMs = 0;

  function loop(currentTimeMs: number): void {
    requestAnimationFrame(loop);

    const deltaTimeMs = currentTimeMs - previousTimeMs;
    if (deltaTimeMs >= frameIntervalMs) {
      // update(state);

      const offset = deltaTimeMs % frameIntervalMs;
      previousTimeMs = currentTimeMs - offset;
    }

    render(state);
  }

  requestAnimationFrame(loop);
}

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
  assert(!!canvas, "canvas not found");
  const seed = getSeed(0);
  const rand = mulberry32(seed);
  const randFuncs = createRand(rand);
  const ctx = canvas.getContext("2d")!;
  assert(!!ctx, "could not get context2d");
  const level = createRandomLevel(randFuncs);
  const config = getGameConfig(seed);
  const state = createGameState(config, ctx, level, randFuncs);

  setupCanvas(state);
  resetCanvas(state);
  setText(state);
  registerMouseEvent(state, "mouseenter", mouseEnter);
  registerMouseEvent(state, "mousemove", mouseMove);
  registerMouseEvent(state, "click", canvasClick, ["hitting", "rolling"]);
  registerMouseEvent(state, "mouseleave", mouseLeave);

  gameLoop(state);
}

main();
