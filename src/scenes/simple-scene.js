import '../music-engine.js';

export class SimpleScene extends Phaser.Scene {
  preload() {
      this.load.image('dude', 'assets/art/musicgame_1.png');
  }
  create() {
      this.add.image(100,100,'dude');
  }
  update() {
  }
}
