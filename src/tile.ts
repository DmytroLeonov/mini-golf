import { State } from "./state";
import { Coord } from "./types";

export const tileTypes = ["fairway", "sand", "rough", "water", "tree"] as const;
export type TileType = (typeof tileTypes)[number];

export interface Renderable {
  render(state: State): void;
}

export interface ITile extends Renderable {
  // canLand(): boolean;
}

abstract class BaseTile {
  readonly type: TileType;
  readonly pos: Coord;

  constructor(type: TileType, pos: Coord) {
    this.type = type;
    this.pos = pos;
  }
}

abstract class SolidTile extends BaseTile implements Renderable {
  protected bg: string;
  protected fg: string;

  constructor(type: TileType, pos: Coord, bg: string, fg: string) {
    super(type, pos);
    this.bg = bg;
    this.fg = fg;
  }

  render(state: State): void {
    const {
      ctx,
      config: { tileSize },
    } = state;
    const radiuses = this.getTileRadiuses(state);
    ctx.beginPath();
    ctx.roundRect(
      this.pos.x * tileSize,
      this.pos.y * tileSize,
      tileSize,
      tileSize,
      radiuses
    );
    ctx.fillStyle = this.bg;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      this.pos.x * tileSize + tileSize / 2,
      this.pos.y * tileSize + tileSize / 2,
      tileSize * 0.1,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = this.fg;
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

export class WaterTile extends SolidTile implements ITile {
  constructor(readonly pos: Coord) {
    super("water", pos, "lightblue", "blue");
  }
}

export class SandTile extends SolidTile implements ITile {
  constructor(readonly pos: Coord) {
    super("sand", pos, "yellow", "orange");
  }
}

export class FairwayTile extends SolidTile implements ITile {
  constructor(readonly pos: Coord) {
    super("fairway", pos, "lime", "gray");
  }
}

export class RoughTile extends SolidTile implements ITile {
  constructor(readonly pos: Coord) {
    super("rough", pos, "white", "lime");
  }
}

export class TreeTile extends SolidTile implements ITile {
  constructor(readonly pos: Coord) {
    super("tree", pos, "green", "green");
  }
}

export const tileClasses = [
  WaterTile,
  SandTile,
  FairwayTile,
  RoughTile,
  TreeTile,
] as const;
export type TileClass = InstanceType<(typeof tileClasses)[number]>;
