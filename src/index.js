import "phaser";

import { SimpleScene } from "./scenes/simple-scene";

const gameConfig = {
  width: 356,
  height: 356,
  pixelArt: true,
  zoom: 2,
  scene: SimpleScene
};

new Phaser.Game(gameConfig);
