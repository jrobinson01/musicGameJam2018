import { MusicEngine } from "../music-engine.js";
import { Player } from "./player.js";

export class SimpleScene extends Phaser.Scene {
  constructor() {
    super();
    document.addEventListener("patternError", () => {
      this.cameras.main.shake(150, 0.03);
    });
  }
  preload() {
    this.load.image("dude", "assets/art/musicgame_3.png");
    this.load.image("tile", "assets/art/musicgame_0.png");
    this.load.image("tile_edge", "assets/art/musicgame_1.png");
    this.load.image("tile_corner", "assets/art/musicgame_2.png");
    this.load.image("marker", "assets/art/musicgame_4.png");
  }
  create() {
    this.musicEngine = new MusicEngine({});
    this.musicEngine.generateRandomSequence();
    this.musicEngine.togglePlay();
    this.drawBoard({});
    this.markerGroup = new Phaser.GameObjects.Group(this);
    this.markers = {};
    this.player = new Player({
      boardSize: { x: 8, y: 8 },
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
    this.keys.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
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
      this.toggleMarker({ x: this.player.x, y: this.player.y });
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.musicEngine.togglePlay();
    }
    this.rows.forEach(row => {
      Phaser.Actions.SetAlpha(row.getChildren(), 1);
    });
    Phaser.Actions.SetAlpha(
      this.rows[this.musicEngine.getPosition()].getChildren(),
      0.7
    );
    const x = this.musicEngine.getPosition();
    const correctMarkers = this.musicEngine.getCorrectMarkers(x);
    if (correctMarkers && correctMarkers.length) {
      correctMarkers.forEach(y => {
        this.markers[`${x},${Math.abs(y - 7)}`].setTint(0xffff44);
      });
    }
  }

  toggleMarker({ x = 0, y = 0 }) {
    if (this.markers[`${x},${y}`]) {
      this.children.remove(this.markers[`${x},${y}`]);
      delete this.markers[`${x},${y}`];
    } else {
      this.markers[`${x},${y}`] = this.add
        .image(x * 16 + 16, y * 16 + 16, "marker")
        .setOrigin(0, 0)
        .setDepth(1);
    }
    this.musicEngine.clearUserPattern();
    Object.keys(this.markers).forEach(key => {
      const xy = key.split(",");
      this.musicEngine.addUserNote(xy[0], Math.abs(xy[1] - 7));
    });
    if (this.musicEngine.checkForWin()) {
      alert("you win.. refresh to try again");
    }
  }

  drawBoard({ xSize = 8, ySize = 8 }) {
    this.rows = [];
    for (let x = 0; x < xSize + 2; x++) {
      if (x > 0) {
        this.rows[x - 1] = new Phaser.GameObjects.Group(this);
      }
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
          this.rows[x - 1].get(x * 16, y * 16, "tile").setOrigin(0, 0);
        }
      }
    }
  }
}
