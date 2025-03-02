import { State } from "./state";
import { Coord } from "./types";

export const tileTypes = ["fairway", "sand", "rough", "water", "tree"] as const;

export type TileType = (typeof tileTypes)[number];

export type Color = {
  dot: string;
  bg: string;
};

export type TileColor = Record<TileType, Color>;

const tileColorMap: TileColor = {
  fairway: { bg: "lime", dot: "gray" },
  rough: { bg: "white", dot: "lime" },
  sand: { bg: "yellow", dot: "orange" },
  tree: { bg: "green", dot: "green" },
  water: { bg: "lightblue", dot: "blue" },
};

export interface ITile {
  render(state: State): void;
}

export class Tile implements ITile {
  constructor(readonly type: TileType, readonly pos: Coord) {}

  render(state: State): void {
    const {
      ctx,
      config: { tileSize },
    } = state;
    const color = tileColorMap[this.type];

    ctx.fillStyle = color.bg;
    ctx.fillRect(
      this.pos.x * tileSize,
      this.pos.y * tileSize,
      tileSize,
      tileSize
    );

    ctx.beginPath()
    ctx.moveTo(this.pos.x, this.pos.y)
    ctx.arc(
      this.pos.x * tileSize + tileSize / 2,
      this.pos.y * tileSize + tileSize / 2,
      tileSize * 0.1,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = color.dot;
    ctx.fill();
  }
}
