import "phaser";
import "./dom-controller.js";
import { SimpleScene } from "./scenes/simple-scene";

const gameConfig = {
  width: 256,
  height: 256,
  pixelArt: true,
  zoom: 3,
  scene: SimpleScene,
  parent: "game"
};

new Phaser.Game(gameConfig);
