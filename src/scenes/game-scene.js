import {MusicEngine} from '../music-engine.js';
import {Player} from './player.js';
import {Enemy} from './enemy.js';
import {Ghost} from './ghost';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
    this.level = 1;
    this.score = 0;
    document.addEventListener('increaseScore', e => {
      this.score =
        this.score +
        Math.max(0, Math.floor(e.detail.points * (this.level / 2)));
      document.dispatchEvent(
        new CustomEvent('updateScore', {
          detail: {score: Math.floor(this.score)}
        })
      );
    });
    document.addEventListener('makeMove', e => {
      this.moves = Math.max(this.moves - 1, 0);
      document.dispatchEvent(
        new CustomEvent('updateMoves', {detail: {moves: this.moves}})
      );
    });
    document.addEventListener('patternError', e => {
      this.cameras.main.shake(150, 0.03);
      this.toggleMarker({x: e.detail.x, y: Math.abs(e.detail.y - 7)});
      this.flash(e.detail.x, e.detail.y);
      this.searchForMarkers(e.detail.x, e.detail.y);
      if (Math.random() < 0.5) {
        this.enemies.push(
          new Enemy({
            x: Math.floor(Math.random() * 8),
            y: Math.floor(Math.random() * 8),
            scene: this,
            sprite: this.add
              .image(0, 0, 'enemy')
              .setOrigin(0, 0)
              .setDepth(10)
          })
        );
      }
    });
    document.addEventListener('tryTheDoor', e => {
      if (e.detail.y === this.door.getData('y') && this.unlocked) {
        const tween = this.tweens.add({
          targets: this.graphics,
          alpha: 1,
          duration: 1000,
          onComplete: () => {
            this.level += 1;
            document.dispatchEvent(
              new CustomEvent('increaseScore', {detail: {points: this.moves}})
            );
            this.scene.restart();
          }
        });
      }
    });
    document.addEventListener('gameOver', e => {
      this.gameOver = true;
      this.cameras.main.shake(3000, 0.006);
      const tween = this.tweens.add({
        targets: this.graphics,
        alpha: 1,
        duration: 2500,
        onComplete: () => {}
      });
      setTimeout(() => {
        this.registry.set('score', this.score);
        this.scene.stop('game-over-scene');
        this.scene.start('game-over-scene', {score: this.score});
      }, 3000);
    });
    document.addEventListener('spawnGhost', () => {
      if (this.ghost) return;
      document.dispatchEvent(new CustomEvent('ghostSound'))
      this.musicEngine.revealGhostPattern();
      this.cameras.main.shake(300, 0.06);
      this.ghost = new Ghost({
        x: Math.floor(Math.random() * 8),
        y: Math.floor(Math.random() * 8),
        scene: this,
        sprite: this.add
          .image(0, 0, 'ghost')
          .setOrigin(0, 0)
          .setDepth(10)
      });
      this.enemies.push(this.ghost);
    });
    this.musicEngine = new MusicEngine({});
    document.dispatchEvent(
      new CustomEvent('printMessage', {
        detail: {message: 'WELCOME TO THE DUNGEON BABY'}
      })
    );
  }
  init() {
    this.moves = 100;
    this.ghost = null;
    this.gameOver = false;
    this.musicEngine.silenceGhostPattern();
    document.dispatchEvent(
      new CustomEvent('updateMoves', {detail: {moves: this.moves}})
    );
    this.unlocked = false;
    this.unplayedNotes = {};
    this.musicEngine.clear();
    this.musicEngine.clearUserPattern();
    this.musicEngine.generateRandomSequence(this.level);
    this.musicEngine.play();
    document.dispatchEvent(
      new CustomEvent('level', {detail: {level: this.level}})
    );
  }
  preload() {
    this.load.image('dude', 'assets/art/musicgame_3.png');
    this.load.image('tile', 'assets/art/musicgame_0.png');
    this.load.image('tile_edge', 'assets/art/musicgame_1.png');
    this.load.image('tile_corner', 'assets/art/musicgame_2.png');
    this.load.image('marker', 'assets/art/musicgame_4.png');
    this.load.image('lockedDoor', 'assets/art/musicgame_6.png');
    this.load.image('unlockedDoor', 'assets/art/musicgame_7.png');
    this.load.image('uncoveredMarker', 'assets/art/musicgame_8.png');
    this.load.image('enemy', 'assets/art/musicgame_5.png');
    this.load.image('ghost', 'assets/art/musicgame_9.png');
  }
  create() {
    this.drawBoard({});
    this.markers = {};
    this.uncoveredMarkers = {};
    this.player = new Player({
      boardSize: {x: 8, y: 8},
      x: 0,
      y: 7,
      sprite: this.add
        .image(0, 0, 'dude')
        .setOrigin(0, 0)
        .setDepth(10)
    });

    this.enemies = [];
    for (let i = 0; i < Math.min(Math.floor(this.level / 3), 10); i++) {
      this.enemies.push(
        new Enemy({
          x: Math.floor(Math.random() * 8),
          y: Math.floor(Math.random() * 8),
          scene: this,
          sprite: this.add
            .image(0, 0, 'enemy')
            .setOrigin(0, 0)
            .setDepth(10)
        })
      );
    }

    // keys
    this.keys = {};
    this.keys.x = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keys.q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keys.help = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH
    );
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
    this.graphics = this.add.graphics({fillStyle: {color: '0x000000'}});
    this.graphics.fillRectShape(this.rect);
    this.graphics.alpha = 1;
    this.graphics.setDepth(100);
    const tween = this.tweens.add({
      targets: this.graphics,
      alpha: 0,
      duration: 1000,
      onComplete: () => {}
    });
    const patternLength = this.musicEngine
      .getPattern()
      .reduce((acc, val) => acc.concat(val), []).length;
    const userPatternLength = this.musicEngine.userPattern.reduce(
      (acc, val) => acc.concat(val),
      []
    ).length;
    document.dispatchEvent(
      new CustomEvent('updateNotes', {
        detail: {patternLength, userPatternLength}
      })
    );
  }
  update() {
    if (this.gameOver) {
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.help)) {
      // alert('I told you not to do that.');
      // this.musicEngine.revealGhostPattern();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.player.move({y: -1});
      this.enemies.forEach(enemy => {
        enemy.move();
      });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.player.move({y: 1});
      this.enemies.forEach(enemy => {
        enemy.move();
      });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.player.move({x: 1});
      this.enemies.forEach(enemy => {
        enemy.move();
      });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.player.move({x: -1});
      this.enemies.forEach(enemy => {
        enemy.move();
      });
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.x)) {
      this.toggleMarker({x: this.player.x, y: this.player.y});
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      document.dispatchEvent(new CustomEvent('makeMove', {detail: {moves: 1}}));
      // document.dispatchEvent(
      //   new CustomEvent('spellCooldownUpdate', {
      //     detail: {
      //       spell: 'blast',
      //       status: this.player.spells.blast.status
      //     }
      //   })
      // );
      const x = this.player.x;
      const y = this.player.y;
      this.flash(x, Math.abs(y - 7), 0xff0000);
      this.enemies.forEach(enemy => {
        if (enemy instanceof Ghost) {
          return;
        }
        if (
          enemy.x <= x + 1 &&
          enemy.x >= x - 1 &&
          enemy.y <= y + 1 &&
          enemy.y >= y - 1
        ) {
          this.children.remove(enemy.sprite);
          this.enemies = this.enemies.filter(filterE => filterE != enemy);
        }
      });
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.q)) {
      if (
        !this.player.spells.search ||
        (this.player.spells.search && this.player.spells.search.status != 0)
      ) {
        return;
      }
      document.dispatchEvent(new CustomEvent('makeMove', {detail: {moves: 1}}));
      document.dispatchEvent(
        new CustomEvent('spellCooldownUpdate', {
          detail: {
            spell: 'search',
            status: this.player.spells.search.status
          }
        })
      );
      this.player.spells.search.status = this.player.spells.search.cooldown;
      this.searchForMarkers(this.player.x, Math.abs(this.player.y - 7));
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
      this.musicEngine.checkForWin() &&
      !this.unlocked
    ) {
      this.door.setTexture('unlockedDoor');
      this.unlocked = true;
      this.enemies.forEach(enemy => {
        if (enemy instanceof Ghost) {
          return;
        }
        this.children.remove(enemy.sprite);
      });
      this.enemies = this.enemies.filter(enemy => enemy instanceof Ghost);
      document.dispatchEvent(new CustomEvent('levelUnlock'));
    }
    if (this.moves == 0) {
      document.dispatchEvent(new CustomEvent('spawnGhost'));
      this.moves -= 1;
    }
    if (
      this.ghost &&
      this.ghost.x == this.player.x &&
      this.ghost.y == this.player.y
    ) {
      document.dispatchEvent(new CustomEvent('gameOver'));
    }
  }

  resetGame() {
    this.score = 0;
    this.level = 1;
    document.dispatchEvent(
      new CustomEvent('updateScore', {
        detail: {score: Math.floor(this.score)}
      })
    );
  }

  searchForMarkers(x, y) {
    const pattern = this.musicEngine.getPattern();
    const foundMarkers = [];
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
        .image(x * 16 + 16, y * 16 + 16, 'uncoveredMarker')
        .setOrigin(0, 0);
    });
    this.flash(x, y);
  }

  flash(x, y, color = 0xcccccc) {
    for (let flashX = x - 1; flashX < x + 2; flashX++) {
      for (
        let flashY = this.player.y - 1;
        flashY < this.player.y + 2;
        flashY++
      ) {
        if (this.rows[flashX] && this.rows[flashX].children.entries[flashY]) {
          this.rows[flashX].children.entries[flashY].setTintFill(color);
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
          if (this.rows[flashX] && this.rows[flashX].children.entries[flashY]) {
            this.rows[flashX].children.entries[flashY].clearTint();
            this.player.sprite.setTint(0xffffff);
          }
        }
      }
    }, 50);
  }

  toggleMarker({x = 0, y = 0}) {
    if (this.markers[`${x},${y}`]) {
      this.children.remove(this.markers[`${x},${y}`]);
      delete this.markers[`${x},${y}`];
      if (this.unplayedNotes[x]) {
        delete this.unplayedNotes[x];
      }
    } else {
      this.unplayedNotes[x] = true;
      this.markers[`${x},${y}`] = this.add
        .image(x * 16 + 16, y * 16 + 16, 'marker')
        .setOrigin(0, 0)
        .setDepth(1);
    }
    this.musicEngine.clearUserPattern();
    Object.keys(this.markers).forEach(key => {
      const xy = key.split(',');
      this.musicEngine.addUserNote(xy[0], Math.abs(xy[1] - 7));
    });
    const patternLength = this.musicEngine
      .getPattern()
      .reduce((acc, val) => acc.concat(val), []).length;
    const userPatternLength = this.musicEngine.userPattern.reduce(
      (acc, val) => acc.concat(val),
      []
    ).length;
    document.dispatchEvent(
      new CustomEvent('updateNotes', {
        detail: {patternLength, userPatternLength}
      })
    );
  }

  drawBoard({xSize = 8, ySize = 8}) {
    const doorY = Math.floor(Math.random() * ySize) + 1;
    this.rows = [];
    for (let x = 0; x < xSize + 2; x++) {
      if (x > 0) {
        this.rows[x - 1] = new Phaser.GameObjects.Group(this);
      }
      for (let y = 0; y < ySize + 2; y++) {
        if (x == 0 && y > 0 && y < ySize + 1) {
          this.add.image(x * 16, y * 16, 'tile_edge').setOrigin(0, 0);
        } else if (x == xSize + 1 && y > 0 && y < ySize + 1) {
          if (y === doorY) {
            this.door = this.add
              .image(x * 16 + 16, y * 16 + 16, 'lockedDoor')
              .setOrigin(1, 1);
            this.door.setData('y', doorY);
          } else {
            this.add
              .image(x * 16, y * 16, 'tile_edge')
              .setOrigin(1, 1)
              .setAngle(180);
          }
        } else if (y == 0 && x > 0 && x < xSize + 1) {
          this.add
            .image(x * 16 + 16, y * 16, 'tile_edge')
            .setOrigin(0, 0)
            .setAngle(90);
        } else if (y == ySize + 1 && x > 0 && x < xSize + 1) {
          this.add
            .image(x * 16, y * 16 + 16, 'tile_edge')
            .setOrigin(0, 0)
            .setAngle(270);
        } else if (x == 0 && y == 0) {
          this.add
            .image(x * 16, y * 16, 'tile_corner')
            .setOrigin(0, 0)
            .setAngle(0);
        } else if (x == 0 && y == ySize + 1) {
          this.add
            .image(x * 16, y * 16 + 16, 'tile_corner')
            .setOrigin(0, 0)
            .setAngle(270);
        } else if (x == xSize + 1 && y == ySize + 1) {
          this.add
            .image(x * 16, y * 16, 'tile_corner')
            .setOrigin(1, 1)
            .setAngle(180);
        } else if (x == xSize + 1 && y == 0) {
          this.add
            .image(x * 16 + 16, y * 16, 'tile_corner')
            .setOrigin(0, 0)
            .setAngle(90);
        } else {
          this.rows[x - 1].get(x * 16, y * 16, 'tile').setOrigin(0, 0);
        }
      }
    }
  }
}
