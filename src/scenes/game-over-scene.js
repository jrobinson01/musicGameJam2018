export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('game-over-scene');
  }
  init() {
    document.dispatchEvent(
      new CustomEvent('displayGameOver', {
        detail: {score: this.registry.get('score')}
      })
    );
  }
  create() {
    this.input.keyboard.on('keydown', event => {
      if (event.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('hideGameOver'));
        document.dispatchEvent(new CustomEvent('hideHighScoreScreen'));
        this.scene.switch('start-scene');
      }
    });
  }
}
