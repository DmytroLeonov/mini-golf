export type Rand = () => number;

export type RandRange = (min: number, max: number) => number;

export type RandFuncs = {
  rand: Rand;
  randInt: Rand;
  randRange: RandRange;
};

export function getSeed(seed?: number): number {
  if (seed !== undefined) {
    return seed;
  }

  return Math.floor(Math.random() * 1000);
}

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rand: Rand): Rand {
  return function () {
    return Math.floor(rand() * 4294967296);
  };
}

export function createRand(rand: Rand): RandFuncs {
  return {
    rand,
    randInt: randInt(rand),
    randRange: randRange(rand),
  };
}

export function randRange(rand: Rand) {
  return function (min: number, max: number) {
    const r = rand();
    return Math.floor(min + r * (max - min));
  };
}

export function now() {
  return Date.now();
}

export async function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
