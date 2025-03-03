export type GameConfig = {
  tileSize: number;
  seed: number;
};

export function getGameConfig(seed: number): GameConfig {
  return {
    tileSize: 50,
    seed,
  };
}
