import "phaser";
import { Game, GameOver, Load, Pause, Start, UI } from "../scenes";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1100,
  scene: [Load, Start, Game, Pause, UI, GameOver],
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

new Phaser.Game(config);

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
