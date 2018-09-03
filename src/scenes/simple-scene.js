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
    this.drawBoard({});
    this.markerGroup = new Phaser.GameObjects.Group(this);
    this.markers = {};
    this.add.image(32, 32, "marker").setOrigin(0, 0);
    this.player = new Player({
      x: 0,
      y: 7,
      sprite: this.add
        .image(0, 0, "dude")
        .setOrigin(0, 0)
        .setDepth(10)
    });
    // keys
    this.keys = {};
    this.keys.x = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.cursors = this.input.keyboard.createCursorKeys();
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.x)) {
      this.addMarker({ x: this.player.x, y: this.player.y });
    }
  }

  addMarker({ x = 0, y = 0 }) {
    this.markers[`${x},${y}`] = this.add
      .image(x * 16 + 16, y * 16 + 16, "marker")
      .setOrigin(0, 0)
      .setDepth(1);
    console.log(this.markers);
  }

  drawBoard({ xSize = 8, ySize = 8 }) {
    for (let x = 0; x < xSize + 2; x++) {
      for (let y = 0; y < ySize + 2; y++) {
        if (x == 0 && y > 0 && y < ySize + 1) {
          this.add.image(x * 16, y * 16, "tile_edge").setOrigin(0, 0);
        } else if (x == xSize + 1 && y > 0 && y < ySize + 1) {
          this.add
            .image(x * 16, y * 16, "tile_edge")
            .setOrigin(1, 1)
            .setAngle(180);
        } else if (y == 0 && x > 0 && x < xSize + 1) {
          this.add
            .image(x * 16 + 16, y * 16, "tile_edge")
            .setOrigin(0, 0)
            .setAngle(90);
        } else if (y == ySize + 1 && x > 0 && x < xSize + 1) {
          this.add
            .image(x * 16, y * 16 + 16, "tile_edge")
            .setOrigin(0, 0)
            .setAngle(270);
        } else if (x == 0 && y == 0) {
          this.add
            .image(x * 16, y * 16, "tile_corner")
            .setOrigin(0, 0)
            .setAngle(0);
        } else if (x == 0 && y == ySize + 1) {
          this.add
            .image(x * 16, y * 16 + 16, "tile_corner")
            .setOrigin(0, 0)
            .setAngle(270);
        } else if (x == xSize + 1 && y == ySize + 1) {
          this.add
            .image(x * 16, y * 16, "tile_corner")
            .setOrigin(1, 1)
            .setAngle(180);
        } else if (x == xSize + 1 && y == 0) {
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
