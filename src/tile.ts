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

    const radiuses = this.getTileRadiuses(state);
    ctx.beginPath();
    ctx.roundRect(
      this.pos.x * tileSize,
      this.pos.y * tileSize,
      tileSize,
      tileSize,
      radiuses
    );
    ctx.fillStyle = color.bg;
    ctx.fill();

    ctx.beginPath();
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

  private getTileRadiuses(state: State): number[] {
    const {
      level: { field },
      config: { tileSize },
    } = state;

    const neighboursToCheck = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];

    const radiuses = [tileSize / 2, tileSize / 2, tileSize / 2, tileSize / 2];
    for (let i = 0; i < neighboursToCheck.length; i++) {
      const neighbourPos = neighboursToCheck[i];
      const neighbouringTile =
        field[this.pos.y + neighbourPos[0]]?.[this.pos.x + neighbourPos[1]];

      if (neighbouringTile?.type === this.type) {
        radiuses[i] = 0;
        const secondCornerIndex = i + 1 === 4 ? 0 : i + 1;
        radiuses[secondCornerIndex] = 0;
      }
    }

    return radiuses;
  }
}
