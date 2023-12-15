import "phaser";
import { Load } from "../scenes/Load";
import { Game } from "../scenes/Game";
import { Pause } from "../scenes/Pause";
import { Start } from "../scenes/Start";
import { UI } from "../scenes/UI";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1100,
  scene: [Load, Start, Game, Pause, UI],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
