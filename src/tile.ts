import { State } from "./state";
import { Coord } from "./types";

export const tileTypes = ["fairway", "sand", "rough", "water", "tree"] as const;

export type TileType = (typeof tileTypes)[number];

const tileColorMap: Record<TileType, string> = {
  fairway: "lime",
  rough: "white",
  sand: "yellow",
  tree: "green",
  water: "blue",
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

    ctx.fillStyle = color;
    ctx.fillRect(
      this.pos.x * tileSize,
      this.pos.y * tileSize,
      tileSize,
      tileSize
    );
  }
}
