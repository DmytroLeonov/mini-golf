export type GameConfig = {
  targetFps: number;
  tileSize: number;
  seed: number;
};

export function newGameConfig(seed: number): GameConfig {
  return {
    targetFps: 60,
    tileSize: 30,
    seed,
  };
}
