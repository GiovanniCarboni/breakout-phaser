import "phaser";
import { LoadScene } from "../scenes/LoadScene";
import { GameScene } from "../scenes/GameScene";
import { PauseScene } from "../scenes/PauseScene";
import { StartScene } from "../scenes/StartScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1100,
  scene: [LoadScene, StartScene, GameScene, PauseScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
