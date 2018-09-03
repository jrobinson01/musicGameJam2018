export class Player {
  constructor({ boardSize = { x: 8, y: 8 }, x = 0, y = 15, sprite = null }) {
    this.boardSize = boardSize;
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.sprite.setPosition(this.x * 16 + 16, this.y * 16 + 16);
  }
  move({ x = 0, y = 0 }) {
    this.x = Math.max(Math.min(this.x + x, this.boardSize.x - 1), 0);
    this.y = Math.max(Math.min(this.y + y, this.boardSize.y - 1), 0);
    this.sprite.setPosition(this.x * 16 + 16, this.y * 16 + 16);
  }
}
