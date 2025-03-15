import { TileClass, tileClasses, tileTypes } from "./tile";
import { RandFuncs } from "./utils";
import { Vec2 } from "./vec2";

export type Field = TileClass[][];

export type Level = {
  tee: Vec2;
  hole: Vec2;
  field: Field;
  w: number;
  h: number;
};

const SLOPE_PERCENTAGE = 10;

function createRandomField(rand: RandFuncs): Field {
  const w = rand.randRange(10, 25);
  const h = rand.randRange(10, 20);

  const field: Field = [];

  for (let y = 0; y < h; y++) {
    const row: TileClass[] = [];
    for (let x = 0; x < w; x++) {
      const randomTileIdx = rand.randRange(0, tileTypes.length);
      const TileClass = tileClasses[randomTileIdx];

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

      row.push(new TileClass(new Vec2(x, y), slope));
    }

    field.push(row);
  }

  return field;
}

export function createRandomLevel(rand: RandFuncs): Level {
  const field = createRandomField(rand);
  const w = field[0].length;
  const h = field.length;

  return {
    tee: new Vec2(Math.floor(w / 2) - 1, Math.floor(h / 2)),
    hole: new Vec2(w - 1, h - 1),
    field,
    w,
    h,
  };
}
