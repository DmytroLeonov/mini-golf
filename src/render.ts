import { assert } from "./assert";
import { State } from "./state";

const seedSpan = document.querySelector<HTMLSpanElement>("#seed")!;
assert(!!seedSpan, "seed span not found");
const widthSpan = document.querySelector<HTMLSpanElement>("#width")!;
assert(!!widthSpan, "seed span not found");
const heightSpan = document.querySelector<HTMLSpanElement>("#height")!;
assert(!!heightSpan, "seed span not found");

export function setText(state: State): void {
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
  ctx.lineWidth = tileSize * 0.1;
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

export function render(state: State): void {
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