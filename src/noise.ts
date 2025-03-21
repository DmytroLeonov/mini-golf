const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

let perlinOctaves = 4;
let perlinAmpFalloff = 0.5;

const scaledCosine = (i: number) => 0.5 * (1.0 - Math.cos(i * Math.PI));

let perlin: number[];

perlin = new Array(PERLIN_SIZE + 1);
for (let i = 0; i < PERLIN_SIZE + 1; i++) {
  perlin[i] = Math.random();
}

export function noise(x: number, y: number = 0, z: number = 0): number {
  if (x < 0) {
    x = -x;
  }
  if (y < 0) {
    y = -y;
  }
  if (z < 0) {
    z = -z;
  }

  let xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
  let xf = x - xi;
  let yf = y - yi;
  let zf = z - zi;
  let rxf, ryf;

  let r = 0;
  let ampl = 0.5;

  let n1, n2, n3;

  for (let o = 0; o < perlinOctaves; o++) {
    let of_ = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

    rxf = scaledCosine(xf);
    ryf = scaledCosine(yf);

    n1 = perlin[of_ & PERLIN_SIZE];
    n1 += rxf * (perlin[(of_ + 1) & PERLIN_SIZE] - n1);
    n2 = perlin[(of_ + PERLIN_YWRAP) & PERLIN_SIZE];
    n2 += rxf * (perlin[(of_ + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
    n1 += ryf * (n2 - n1);

    of_ += PERLIN_ZWRAP;
    n2 = perlin[of_ & PERLIN_SIZE];
    n2 += rxf * (perlin[(of_ + 1) & PERLIN_SIZE] - n2);
    n3 = perlin[(of_ + PERLIN_YWRAP) & PERLIN_SIZE];
    n3 += rxf * (perlin[(of_ + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
    n2 += ryf * (n3 - n2);

    n1 += scaledCosine(zf) * (n2 - n1);

    r += n1 * ampl;
    ampl *= perlinAmpFalloff;
    xi <<= 1;
    xf *= 2;
    yi <<= 1;
    yf *= 2;
    zi <<= 1;
    zf *= 2;

    if (xf >= 1.0) {
      xi++;
      xf--;
    }
    if (yf >= 1.0) {
      yi++;
      yf--;
    }
    if (zf >= 1.0) {
      zi++;
      zf--;
    }
  }

  return r;
}
