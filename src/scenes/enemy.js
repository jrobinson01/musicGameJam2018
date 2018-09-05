export class Enemy {
  constructor({
    boardSize = { x: 8, y: 8 },
    x = 0,
    y = 7,
    sprite = null,
    scene = null
  }) {
    this.boardSize = boardSize;
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.sprite = sprite;
    this.sprite.setPosition(this.x * 16 + 16, this.y * 16 + 16);
  }
  move() {
    const x = Math.floor(Math.random() * 3) - 1;
    const y = Math.floor(Math.random() * 3) - 1;

    const newX = Math.max(Math.min(this.x + x, this.boardSize.x - 1), 0);
    const newY = Math.max(Math.min(this.y + y, this.boardSize.y - 1), 0);
    if (newX !== this.scene.player.x || newY != this.scene.player.y) {
      let enemyCollision = false;
      this.scene.enemies.forEach(enemy => {
        if (enemy.x == newX && enemy.y == newY) {
          enemyCollision = true;
        }
      });
      if (!enemyCollision) {
        this.x = newX;
        this.y = newY;
        this.sprite.setPosition(this.x * 16 + 16, this.y * 16 + 16);
      }
    }
    // check for markers to eat
    Object.keys(this.scene.markers).forEach(markerKey => {
      const xy = markerKey.split(",");
      if (this.x == xy[0] && this.y == xy[1]) {
        console.log(xy);
        this.scene.toggleMarker({ x: xy[0], y: xy[1] });
      }
    });
  }
}
