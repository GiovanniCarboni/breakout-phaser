import { createMenu } from "../components/UI/Menu";
import { Scenes } from "../constants";
import t from "../i18next/i18next";

export class Start extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.start });
  }

  create() {
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
