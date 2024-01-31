import { transition } from "../anims/SceneTransitions";
import { createMenu } from "../components/UI/Menu";
import { Scenes } from "../constants";
import t from "../i18next/i18next";

export class Start extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.start });
  }

  create() {
    transition("fadeIn", this);

    this.scene.run(Scenes.ui);
    this.scene.moveAbove(Scenes.ui);

    this.cameras.main.setBackgroundColor("#000");

    createMenu(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      [
        { label: t("Start"), onClick: this.handleStart, isMain: true },
        { label: t("Custom Level"), onClick: this.handleCustomLevel },
        { label: t("Options"), onClick: this.handleOptions },
      ],
      this
    );
  }

  handleStart() {
    transition("fadeOut", this, () => {
      this.scene.stop();
      this.scene.start(Scenes.game, { isCustom: false });
    });
  }
  handleCustomLevel() {
    transition("fadeOut", this, () => {
      this.scene.start(Scenes.LevelEditor);
      this.scene.stop();
    });
  }
  handleOptions() {
    transition("fadeOut", this, () => {
      this.scene.stop();
      this.scene.start(Scenes.options, { fromScene: Scenes.start });
    });
  }
}
