import { TileClass, tileClasses, tileTypes } from "./tile";
import { Coord } from "./types";
import { RandFuncs } from "./utils";

export type Field = TileClass[][];

export type Level = {
  tee: Coord;
  hole: Coord;
  field: Field;
  w: number;
  h: number;
};

function createRandomField(rand: RandFuncs): Field {
  const w = rand.randRange(10, 30);
  const h = rand.randRange(10, 30);

  const field: Field = [];

  for (let y = 0; y < w; y++) {
    const row: TileClass[] = [];
    for (let x = 0; x < h; x++) {
      const randomTileIdx = rand.randRange(0, tileTypes.length);
      const TileClass = tileClasses[randomTileIdx];

      row.push(new TileClass({ x, y }));
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
    tee: { x: 0, y: 0 },
    hole: { x: w - 1, y: h - 1 },
    field,
    w,
    h,
  };
}
