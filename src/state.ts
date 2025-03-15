import { GameConfig } from "./game-config";
import { Level } from "./level";
import { Coord } from "./types";
import { RandFuncs } from "./utils";

export type Current = "hitting" | "rolling";

export type State = {
  current: Current;
  validMoves: Coord[];
  ball: Coord;
  roll: number;
  hoveredTile: Coord | null;
  config: GameConfig;
  level: Level;
  ctx: CanvasRenderingContext2D;
  rand: RandFuncs;
};

export function createGameState(
  config: GameConfig,
  ctx: CanvasRenderingContext2D,
  level: Level,
  rand: RandFuncs
): State {
  return {
    current: "rolling",
    validMoves: [],
    ball: level.tee,
    roll: 0,
    hoveredTile: null,
    config,
    level,
    ctx,
    rand,
  };
}
