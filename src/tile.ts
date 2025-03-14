import { renderTriangle } from "./render";
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
    const size = tileSize * 0.25;
    renderTriangle(state, this.pos, {
      v1: { angle: 0, size },
      v2: { angle: (2 * Math.PI) / 3.5, size },
      v3: { angle: -(2 * Math.PI) / 3.5, size },
      angle: Math.atan2(dy, dx),
      offset: {
        x: -dx * 3,
        y: -dy * 3,
      },
      color: this.fg,
    });
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

export class TreeTile extends BaseTile implements ITile {
  constructor(pos: Coord) {
    super("tree", pos, null);
  }

  render(state: State): void {
    const {
      config: { tileSize },
      ctx,
    } = state;
    const size = tileSize * 0.25;

    const trunkSize = tileSize / 8;
    const offsetY = trunkSize / 2;

    ctx.fillStyle = "brown";
    ctx.fillRect(
      this.pos.x * tileSize + tileSize / 2 - trunkSize / 2,
      this.pos.y * tileSize + tileSize / 2 + trunkSize / 2 + offsetY,
      trunkSize,
      trunkSize
    );

    renderTriangle(state, this.pos, {
      v1: { angle: 0, size: size * 0.8 },
      v2: { angle: (2 * Math.PI) / 3, size: size * 1.1 },
      v3: { angle: -(2 * Math.PI) / 3, size: size * 1.1 },
      angle: -Math.PI / 2,
      offset: {
        x: 0,
        y: -tileSize / 5,
      },
      color: "green",
    });

    renderTriangle(state, this.pos, {
      v1: { angle: 0, size: size * 0.8 },
      v2: { angle: (2 * Math.PI) / 3, size: size * 1.3 },
      v3: { angle: -(2 * Math.PI) / 3, size: size * 1.3 },
      angle: -Math.PI / 2,
      offset: {
        x: 0,
        y: 0,
      },
      color: "green",
    });
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
