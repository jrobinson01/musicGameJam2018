export class Player {
  constructor({ x = 0, y = 15, sprite = null }) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.sprite.setPosition(this.x * 16 + 16, this.y * 16 + 16);
  }
  move({ x = 0, y = 0 }) {
    this.x = Math.max(Math.min(this.x + x, 15), 0);
    this.y = Math.max(Math.min(this.y + y, 15), 0);
    this.sprite.setPosition(this.x * 16 + 16, this.y * 16 + 16);
  }
}
