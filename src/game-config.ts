export type GameConfig = {
  targetFps: number;
  tileSize: number;
  seed: number;
};

export function getGameConfig(seed: number): GameConfig {
  return {
    targetFps: 60,
    tileSize: 50,
    seed,
  };
}
