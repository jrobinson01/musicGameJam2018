import {MusicEngine} from '../music-engine.js';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('start-scene');
  }
  create() {
    document.dispatchEvent(new CustomEvent('showStartScreen'));
    this.input.keyboard.on('keydown', event => {
      this.scene.stop('game-scene');
      this.scene.start('game-scene');
      this.scene.get('game-scene').resetGame();
      document.dispatchEvent(new CustomEvent('hideStartScreen'));
      document.dispatchEvent(new CustomEvent('levelUnlock'));
    });
  }
}
