import { createMenu } from "../components/UI/Menu";
import { Scenes, Sounds, Sprites } from "../constants";

export class Start extends Phaser.Scene {
  // private sounds!: {
  //   [key: string]:
  //     | Phaser.Sound.NoAudioSound
  //     | Phaser.Sound.HTML5AudioSound
  //     | Phaser.Sound.WebAudioSound;
  // };

  constructor() {
    super({ key: Scenes.start });
  }

  create() {
    this.scene.run(Scenes.ui);
    this.scene.moveAbove(Scenes.ui);

    // this.sounds = {
    //   shuffle: this.sound.add(Sounds.shuffle, { loop: false, volume: 0.2 }),
    //   btnPressed: this.sound.add(Sounds.buttonPress, {
    //     loop: false,
    //     volume: 0.2,
    //   }),
    // };

    this.cameras.main.setBackgroundColor("#000");

    createMenu(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      [
        { label: "Start", onClick: this.handleStart, isMain: true },
        { label: "Custom Level", onClick: this.handleCustomLevel },
        { label: "Options", onClick: this.handleOptions },
      ],
      this
    );
  }

  handleStart() {
    this.scene.start(Scenes.game, { isCustom: false });
    this.scene.stop();
  }
  handleCustomLevel() {
    this.scene.start(Scenes.LevelEditor);
    this.scene.stop();
  }
  handleOptions() {
    // console.log("handle options")
  }
}
