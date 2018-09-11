import {Enemy} from './enemy';

export class Ghost extends Enemy {
  constructor(config) {
    super(config);
    this.moveCounter = 0;
  }
  move() {
    if (this.moveCounter % 3 !== 0) {
      let newX = this.scene.player.x > this.x ? this.x + 1 : this.x - 1;
      if (this.x == this.scene.player.x) {
        newX = this.x;
      }
      let newY = this.scene.player.y > this.y ? this.y + 1 : this.y - 1;
      if (this.y == this.scene.player.y) {
        newY = this.y;
      }
      this.x = newX;
      this.y = newY;
      this.sprite.setPosition(this.x * 16 + 16, this.y * 16 + 16);
    }
    this.moveCounter += 1;
  }
}
