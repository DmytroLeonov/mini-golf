import { assert } from "./assert";
import { canvasClick, registerEvent } from "./events";
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
    canvas,
    config: { tileSize },
    level,
  } = state;

  canvas.width = level.w * tileSize;
  canvas.height = level.h * tileSize;
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
  const state = createGameState(config, canvas, ctx, level, randFuncs);

  setupCanvas(state);
  resetCanvas(state);
  setText(state);
  registerEvent(state, canvasClick, ["hitting", "rolling"]);
  render(state);
}

main();
