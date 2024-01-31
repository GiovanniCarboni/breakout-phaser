import "phaser";
import {
  Game,
  GameOver,
  LanguageSelection,
  LevelEditor,
  Load,
  Options,
  Pause,
  Start,
  UI,
  WinGame,
} from "../scenes";
import { Scenes } from "../constants";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 1100,
  scene: [
    Load,
    Start,
    Game,
    Pause,
    UI,
    GameOver,
    LevelEditor,
    WinGame,
    LanguageSelection,
    Options,
  ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
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

// async function connectRadio() {
//   try {
//     const res = await fetch(
//       `http://www.radio-browser.info/webservice/json/stations/bycountryexact/Italy`
//     );
//     const data = await res.json();
//     console.log(data);
//   } catch (err) {
//     console.error(err);
//   }
// }
// connectRadio();
