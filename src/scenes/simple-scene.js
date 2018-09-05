import { MusicEngine } from "../music-engine.js";
import { Player } from "./player.js";

export class SimpleScene extends Phaser.Scene {
  constructor() {
    super("simple-scene");
    document.addEventListener("patternError", () => {
      this.cameras.main.shake(150, 0.03);
    });
    document.addEventListener("tryTheDoor", e => {
      console.log(e.detail.y, this.door.getData("y"));
      if (e.detail.y === this.door.getData("y") && this.unlocked) {
        const tween = this.tweens.add({
          targets: this.graphics,
          alpha: 1,
          duration: 1000,
          onComplete: () => {
            this.scene.restart();
          }
        });
      }
    });
    this.musicEngine = new MusicEngine({});
  }
  init() {
    this.unlocked = false;
    this.unplayedNotes = {};
    this.musicEngine.clear();
    this.musicEngine.clearUserPattern();
    this.musicEngine.generateRandomSequence();
    // this.musicEngine.play();
  }
  preload() {
    this.load.image("dude", "assets/art/musicgame_3.png");
    this.load.image("tile", "assets/art/musicgame_0.png");
    this.load.image("tile_edge", "assets/art/musicgame_1.png");
    this.load.image("tile_corner", "assets/art/musicgame_2.png");
    this.load.image("marker", "assets/art/musicgame_4.png");
    this.load.image("lockedDoor", "assets/art/musicgame_6.png");
    this.load.image("unlockedDoor", "assets/art/musicgame_7.png");
    this.load.image("uncoveredMarker", "assets/art/musicgame_8.png");
  }
  create() {
    this.drawBoard({});
    this.markers = {};
    this.uncoveredMarkers = {};
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
    this.keys.q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keys.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.cursors = this.input.keyboard.createCursorKeys();

    //this rectangle is used for fading the screen in/out
    this.rect = new Phaser.Geom.Rectangle(
      0,
      0,
      this.sys.game.config.width,
      this.sys.game.config.height
    );
    this.graphics = this.add.graphics({ fillStyle: { color: "0x000000" } });
    this.graphics.fillRectShape(this.rect);
    this.graphics.alpha = 1;
    this.graphics.setDepth(100);
    const tween = this.tweens.add({
      targets: this.graphics,
      alpha: 0,
      duration: 1000,
      onComplete: () => {}
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.x)) {
      this.toggleMarker({ x: this.player.x, y: this.player.y });
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.q)) {
      console.log("casting reveal spell");
      if (
        !this.player.spells.search ||
        (this.player.spells.search && this.player.spells.search.status != 0)
      ) {
        return;
      }
      this.player.spells.search.status = this.player.spells.search.cooldown;
      const x = this.player.x;
      const y = Math.abs(this.player.y - 7);
      const pattern = this.musicEngine.getPattern();
      const foundMarkers = [];
      for (let flashX = x - 1; flashX < x + 2; flashX++) {
        for (
          let flashY = this.player.y - 1;
          flashY < this.player.y + 2;
          flashY++
        ) {
          if (this.rows[flashX] && this.rows[flashX].children.entries[flashY]) {
            this.rows[flashX].children.entries[flashY].setTintFill(0xcccccc);
            this.player.sprite.setTintFill(0x000000);
          }
        }
      }
      setTimeout(() => {
        for (let flashX = x - 1; flashX < x + 2; flashX++) {
          for (
            let flashY = this.player.y - 1;
            flashY < this.player.y + 2;
            flashY++
          ) {
            if (
              this.rows[flashX] &&
              this.rows[flashX].children.entries[flashY]
            ) {
              this.rows[flashX].children.entries[flashY].setTint(0xffffff);
              this.player.sprite.setTint(0xffffff);
            }
          }
        }
      }, 50);
      pattern.forEach((arr, i) => {
        if (i <= x + 1 && i >= x - 1) {
          arr.forEach(noteVal => {
            if (noteVal <= y + 1 && noteVal >= y - 1) {
              foundMarkers.push([i, noteVal]);
            }
          });
        }
      });
      foundMarkers.forEach(marker => {
        const x = marker[0];
        const y = Math.abs(marker[1] - 7);
        this.uncoveredMarkers[`${x},${y}`] = this.add
          .image(x * 16 + 16, y * 16 + 16, "uncoveredMarker")
          .setOrigin(0, 0);
      });
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
        this.markers[`${x},${Math.abs(y - 7)}`].setTintFill(0x68d8ab);
      });
    }
    if (this.unplayedNotes[x]) {
      delete this.unplayedNotes[x];
    }
    if (
      !Object.keys(this.unplayedNotes).length &&
      this.musicEngine.checkForWin()
    ) {
      this.door.setTexture("unlockedDoor");
      this.unlocked = true;
    }
  }

  toggleMarker({ x = 0, y = 0 }) {
    if (this.markers[`${x},${y}`]) {
      this.children.remove(this.markers[`${x},${y}`]);
      delete this.markers[`${x},${y}`];
      if (this.unplayedNotes[x]) {
        delete this.unplayedNotes[x];
      }
    } else {
      this.unplayedNotes[x] = true;
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
  }

  drawBoard({ xSize = 8, ySize = 8 }) {
    const doorY = Math.floor(Math.random() * ySize) + 1;
    this.rows = [];
    for (let x = 0; x < xSize + 2; x++) {
      if (x > 0) {
        this.rows[x - 1] = new Phaser.GameObjects.Group(this);
      }
      for (let y = 0; y < ySize + 2; y++) {
        if (x == 0 && y > 0 && y < ySize + 1) {
          this.add.image(x * 16, y * 16, "tile_edge").setOrigin(0, 0);
        } else if (x == xSize + 1 && y > 0 && y < ySize + 1) {
          if (y === doorY) {
            this.door = this.add
              .image(x * 16 + 16, y * 16 + 16, "lockedDoor")
              .setOrigin(1, 1);
            this.door.setData("y", doorY);
          } else {
            this.add
              .image(x * 16, y * 16, "tile_edge")
              .setOrigin(1, 1)
              .setAngle(180);
          }
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
