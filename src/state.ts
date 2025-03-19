import { GameConfig } from "./game-config";
import { Level } from "./level";
import { RandFuncs } from "./utils";
import { Vec2 } from "./vec2";

export type MoveWithTrail = {
  pos: Vec2;
  trail: Vec2[];
};

export type State = {
  validMoves: MoveWithTrail[];
  invalidMoves: Vec2[];
  ball: Vec2;
  roll: number;
  rolls: number;
  hits: number;
  hoveredTile: Vec2 | null;
  config: GameConfig;
  level: Level;
  ctx: CanvasRenderingContext2D;
  seededRand: RandFuncs;
  rand: RandFuncs;
};

export function createGameState(
  config: GameConfig,
  ctx: CanvasRenderingContext2D,
  level: Level,
  rand: RandFuncs,
  seededRand: RandFuncs
): State {
  return {
    validMoves: [],
    invalidMoves: [],
    ball: level.tee,
    roll: 0,
    rolls: 0,
    hits: 0,
    hoveredTile: null,
    config,
    level,
    ctx,
    seededRand,
    rand,
  };
}
