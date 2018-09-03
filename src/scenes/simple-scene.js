import "../music-engine.js";
import { Player } from "./player.js";

export class SimpleScene extends Phaser.Scene {
  preload() {
    this.load.image("dude", "assets/art/musicgame_3.png");
    this.load.image("tile", "assets/art/musicgame_0.png");
    this.load.image("tile_edge", "assets/art/musicgame_1.png");
    this.load.image("tile_corner", "assets/art/musicgame_2.png");
    this.load.image("marker", "assets/art/musicgame_4.png");
  }
  create() {
    this.drawBoard();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.player = new Player({
      sprite: this.add.image(0, 0, "dude").setOrigin(0, 0)
    });
  }
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.player.move({ y: -1 });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.player.move({ y: 1 });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.player.move({ x: 1 });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.player.move({ x: -1 });
    }
  }

  drawBoard() {
    for (let x = 0; x < 18; x++) {
      for (let y = 0; y < 18; y++) {
        if (x == 0 && y > 0 && y < 17) {
          this.add.image(x * 16, y * 16, "tile_edge").setOrigin(0, 0);
        } else if (x == 17 && y > 0 && y < 17) {
          this.add
            .image(x * 16, y * 16, "tile_edge")
            .setOrigin(1, 1)
            .setAngle(180);
        } else if (y == 0 && x > 0 && x < 17) {
          this.add
            .image(x * 16 + 16, y * 16, "tile_edge")
            .setOrigin(0, 0)
            .setAngle(90);
        } else if (y == 17 && x > 0 && x < 17) {
          this.add
            .image(x * 16, y * 16 + 16, "tile_edge")
            .setOrigin(0, 0)
            .setAngle(270);
        } else if (x == 0 && y == 0) {
          this.add
            .image(x * 16, y * 16, "tile_corner")
            .setOrigin(0, 0)
            .setAngle(0);
        } else if (x == 0 && y == 17) {
          this.add
            .image(x * 16, y * 16 + 16, "tile_corner")
            .setOrigin(0, 0)
            .setAngle(270);
        } else if (x == 17 && y == 17) {
          this.add
            .image(x * 16, y * 16, "tile_corner")
            .setOrigin(1, 1)
            .setAngle(180);
        } else if (x == 17 && y == 0) {
          this.add
            .image(x * 16 + 16, y * 16, "tile_corner")
            .setOrigin(0, 0)
            .setAngle(90);
        } else {
          this.add.image(x * 16, y * 16, "tile").setOrigin(0, 0);
        }
      }
    }
  }
}
