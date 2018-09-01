export class SimpleScene extends Phaser.Scene {
  preload() {
      this.load.image('cokecan', '/assets/cokecan.png');
  }
  create() {
      this.add.text(0,0,"HELLO WORLD");
      this.add.image(100,100,'cokecan');
  }
  update() {
  }
}
