import { State } from "./state";
import { Coord } from "./types";

export const tileTypes = ["fairway", "sand", "rough", "water", "tree"] as const;
export type TileType = (typeof tileTypes)[number];

export type Slope = [number, number];

export interface Renderable {
  render(state: State): void;
}

export interface ITile extends Renderable {
  // canLand(): boolean;
}

abstract class BaseTile {
  readonly type: TileType;
  readonly pos: Coord;
  readonly slope: Slope | null;

  constructor(type: TileType, pos: Coord, slope: Slope | null) {
    this.type = type;
    this.pos = pos;
    this.slope = slope;
  }
}

abstract class SolidTile extends BaseTile implements Renderable {
  protected bg: string;
  protected fg: string;

  constructor(
    type: TileType,
    pos: Coord,
    slope: Slope | null,
    bg: string,
    fg: string
  ) {
    super(type, pos, slope);
    this.bg = bg;
    this.fg = fg;
  }

  render(state: State): void {
    const {
      ctx,
      config: { tileSize },
    } = state;
    const posXOnCanvas = this.pos.x * tileSize;
    const posYOnCanvas = this.pos.y * tileSize;
    const radiuses = this.getTileRadiuses(state);
    ctx.beginPath();
    ctx.roundRect(posXOnCanvas, posYOnCanvas, tileSize, tileSize, radiuses);
    ctx.fillStyle = this.bg;
    ctx.fill();

    if (!this.slope) {
      ctx.beginPath();
      ctx.arc(
        posXOnCanvas + tileSize / 2,
        posYOnCanvas + tileSize / 2,
        tileSize * 0.1,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = this.fg;
      ctx.fill();
      return;
    }

    ctx.beginPath();
    const [dy, dx] = this.slope;
    const xCenter = posXOnCanvas + tileSize / 2 - dx * 3;
    const yCenter = posYOnCanvas + tileSize / 2 - dy * 3;
    const angle = Math.atan2(dy, dx);
    const size = tileSize * 0.25;

    ctx.moveTo(
      xCenter + Math.cos(angle) * size,
      yCenter + Math.sin(angle) * size
    );
    ctx.lineTo(
      xCenter + Math.cos(angle + (2 * Math.PI) / 3.5) * size,
      yCenter + Math.sin(angle + (2 * Math.PI) / 3.5) * size
    );
    ctx.lineTo(
      xCenter + Math.cos(angle - (2 * Math.PI) / 3.5) * size,
      yCenter + Math.sin(angle - (2 * Math.PI) / 3.5) * size
    );
    ctx.closePath();
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
  constructor(pos: Coord) {
    super("water", pos, null, "lightblue", "blue");
  }
}

export class SandTile extends SolidTile implements ITile {
  constructor(pos: Coord, slope: Slope | null) {
    super("sand", pos, slope, "yellow", "orange");
  }
}

export class FairwayTile extends SolidTile implements ITile {
  constructor(pos: Coord, slope: Slope | null) {
    super("fairway", pos, slope, "lime", "gray");
  }
}

export class RoughTile extends SolidTile implements ITile {
  constructor(pos: Coord, slope: Slope | null) {
    super("rough", pos, slope, "white", "lime");
  }
}

export class TreeTile extends SolidTile implements ITile {
  constructor(pos: Coord) {
    super("tree", pos, null, "green", "green");
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
