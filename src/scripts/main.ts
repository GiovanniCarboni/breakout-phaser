import "phaser";
import {
  Load,
  Game,
  Start,
  Pause,
  UI,
  GameOver,
  LevelEditor,
  WinGame,
  LanguageSelection,
  Options,
  CreatedLevels,
} from "../scenes";
import { Scenes } from "../constants";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 1100,
  scene: [
    Load,
    Game,
    Start,
    Pause,
    UI,
    GameOver,
    LevelEditor,
    WinGame,
    LanguageSelection,
    Options,
    CreatedLevels,
  ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      // debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

game.events.on("blur", () => {
  if (!game.scene.isActive(Scenes.game)) return;
  game.scene.pause(Scenes.game);
  game.scene.start(Scenes.pause);
});
