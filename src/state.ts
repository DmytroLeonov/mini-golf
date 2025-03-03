import { GameConfig } from "./game-config";
import { Level } from "./level";
import { Coord } from "./types";
import { RandFuncs } from "./utils";

export type State = {
  ball: Coord;
  config: GameConfig;
  level: Level;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rand: RandFuncs;
};

export function createGameState(
  config: GameConfig,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  level: Level,
  rand: RandFuncs
): State {
  return {
    ball: level.tee,
    config,
    level,
    canvas,
    ctx,
    rand,
  };
}
