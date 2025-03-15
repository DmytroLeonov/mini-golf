export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vec2): Vec2 {
    this.x += other.x;
    this.y += other.y;

    return this;
  }

  addCopy(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  addComponents(x: number, y: number): Vec2 {
    this.x + x;
    this.y + y;

    return this;
  }

  addComponentsCopy(x: number, y: number): Vec2 {
    return new Vec2(this.x + x, this.y + y);
  }

  centerInTile(tileSize: number): Vec2 {
    this.x = this.x * tileSize + tileSize / 2;
    this.y = this.y * tileSize + tileSize / 2;

    return this;
  }

  centerIntTileCopy(tileSize: number): Vec2 {
    const x = this.x * tileSize + tileSize / 2;
    const y = this.y * tileSize + tileSize / 2;

    return new Vec2(x, y);
  }

  multiply(scalar: number): Vec2 {
    this.x *= scalar;
    this.y *= scalar;

    return this;
  }

  multiplyCopy(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  equals(other: Vec2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  toString(): string {
    return `Vec2(${this.x}, ${this.y})`;
  }
}
