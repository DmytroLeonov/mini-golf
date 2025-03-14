import { GameConfig } from "./game-config";
import { Level } from "./level";
import { Coord } from "./types";
import { RandFuncs } from "./utils";

export type Current = "hitting" | "rolling";

export type State = {
  current: Current;
  ball: Coord;
  hoveredTile: Coord | null;
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
    current: "rolling",
    ball: level.tee,
    hoveredTile: null,
    config,
    level,
    canvas,
    ctx,
    rand,
  };
}
