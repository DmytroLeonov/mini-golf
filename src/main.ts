import { getGameConfig } from "./game-config";
import { createRandomLevel } from "./level";
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

const seedSpan = document.querySelector<HTMLSpanElement>("#seed")!;
const widthSpan = document.querySelector<HTMLSpanElement>("#width")!;
const heightSpan = document.querySelector<HTMLSpanElement>("#height")!;

function setText(state: State): void {
  const {
    config: { seed },
    level: { h, w },
  } = state;
  seedSpan.innerText = seed + "";
  widthSpan.innerText = w + "";
  heightSpan.innerText = h + "";
}

function renderBall(state: State): void {
  const {
    ball,
    config: { tileSize },
    ctx,
  } = state;

  ctx.beginPath();
  ctx.arc(
    ball.x * tileSize + tileSize / 2,
    ball.y * tileSize + tileSize / 2,
    tileSize * 0.3,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function renderHole(state: State): void {
  const {
    level: { hole },
    config: { tileSize },
    ctx,
  } = state;

  ctx.beginPath();
  ctx.arc(
    hole.x * tileSize + tileSize / 2,
    hole.y * tileSize + tileSize / 2,
    tileSize * 0.4,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = "black";
  ctx.fill();
}

function render(state: State): void {
  const { level, canvas, ctx } = state;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const row of level.field) {
    for (const tile of row) {
      tile.render(state);
    }
  }

  renderBall(state);
  renderHole(state);
}

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
  const seed = getSeed(0);
  const rand = mulberry32(seed);
  const randFuncs = createRand(rand);
  const ctx = canvas.getContext("2d")!;
  const level = createRandomLevel(randFuncs);
  const config = getGameConfig(seed);
  const state = createGameState(config, canvas, ctx, level, randFuncs);

  setupCanvas(state);
  resetCanvas(state);
  setText(state);
  render(state);
}

main();
