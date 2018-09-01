import "phaser";

import { SimpleScene } from "./scenes/simple-scene";

const gameConfig = {
  width: 256,
  height: 256,
  pixelArt: true,
  zoom: 2,
  scene: SimpleScene
};

new Phaser.Game(gameConfig);
