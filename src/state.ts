import { GameConfig } from "./game-config";
import { Level } from "./level";
import { RandFuncs } from "./utils";
import { Vec2 } from "./vec2";

export type MoveWithTrail = {
  pos: Vec2;
  trail: Vec2[];
};

export type Current = "hitting" | "rolling";

export type State = {
  current: Current;
  validMoves: MoveWithTrail[];
  invalidMoves: Vec2[];
  ball: Vec2;
  roll: number;
  hoveredTile: Vec2 | null;
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
    invalidMoves: [],
    ball: level.tee,
    roll: 0,
    hoveredTile: null,
    config,
    level,
    ctx,
    rand,
  };
}
