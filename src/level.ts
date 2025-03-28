import {
  FairwayTile,
  RoughTile,
  SandTile,
  TileClass,
  tileClasses,
  TileType,
  TreeTile,
  WaterTile,
} from "./tile";
import { RandFuncs } from "./utils";
import { Vec2 } from "./vec2";
import { noise } from "./noise";
import { never } from "./assert";

export type Field = TileClass[][];

export type Level = {
  tee: Vec2;
  hole: Vec2;
  field: Field;
  w: number;
  h: number;
};

const SLOPE_PERCENTAGE = 100;
const NOISE_OFFSET = 0.2;
const MIN_W = 10;
const MAX_W = 20;
const MIN_H = 10;
const MAX_H = 20;

type Perlin = {
  x: number;
  y: number;
  r: number;
};

type CumSum = Array<{ tileType: TileType; min: number; max: number }>;

function matchRange(cumSum: CumSum, n: number): TileType {
  for (const cs of cumSum) {
    if (cs.min <= n && n <= cs.max) {
      return cs.tileType;
    }
  }

  never(`could not match range for cumSum=${cumSum} and n=${n}`);
}

function createRandomField(rand: RandFuncs): Field {
  const w = rand.randRange(MIN_W, MAX_W);
  const h = rand.randRange(MIN_H, MAX_H);

  const perlin: Perlin[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = noise(x * NOISE_OFFSET, y * NOISE_OFFSET);
      perlin.push({ x, y, r });
    }
  }

  perlin.sort((a, b) => a.r - b.r);

  const ratios: Record<TileType, number> = {
    water: 10,
    sand: 10,
    rough: 20,
    fairway: 30,
    tree: 20,
  };

  const classMapping: Record<TileType, (typeof tileClasses)[number]> = {
    water: WaterTile,
    sand: SandTile,
    rough: RoughTile,
    fairway: FairwayTile,
    tree: TreeTile,
  };

  const cumSum: CumSum = (
    Object.entries(ratios) as [TileType, number][]
  ).reduce((acc, [tileType, percentage], i) => {
    if (i === 0) {
      return [{ tileType, min: 0, max: percentage }];
    }

    const prevMax = acc.at(-1)!.max;
    const max = prevMax + percentage;

    return [...acc, { tileType, min: prevMax, max }];
  }, [] as CumSum);

  const total = cumSum.at(-1)!.max;

  const field: Field = new Array(h).fill(0).map(() => []);
  const totalTiles = h * w;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const p = perlin[i];

      const tileType = matchRange(cumSum, (i / totalTiles) * total);
      const TileClass = classMapping[tileType];

      let slope: Vec2 | null = null;
      if (rand.randRange(0, 100) < SLOPE_PERCENTAGE) {
        const possibleDirs: Vec2[] = [
          new Vec2(0, -1),
          new Vec2(1, 0),
          new Vec2(0, 1),
          new Vec2(-1, 0),
        ];
        slope = possibleDirs[rand.randRange(0, possibleDirs.length)];
      }

      field[p.y][p.x] = new TileClass(new Vec2(p.x, p.y), slope);
    }
  }

  return field;
}

export function createRandomLevel(rand: RandFuncs): Level {
  const field = createRandomField(rand);
  const w = field[0].length;
  const h = field.length;

  return {
    tee: new Vec2(Math.floor(w / 2) - 1, Math.floor(h / 2)),
    hole: new Vec2(w - 5, h - 5),
    field,
    w,
    h,
  };
}
