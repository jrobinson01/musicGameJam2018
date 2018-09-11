import "phaser";
import "./dom-controller.js";
import { GameScene } from "./scenes/game-scene.js";
import {StartScene} from "./scenes/start-scene.js"
import { GameOverScene } from "./scenes/game-over-scene.js";

const gameConfig = {
  width: 256,
  height: 256,
  pixelArt: true,
  zoom: 3,
  scene: [StartScene, GameScene, GameOverScene],
  parent: "game"
};

new Phaser.Game(gameConfig);
