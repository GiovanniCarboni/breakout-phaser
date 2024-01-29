import { t } from "i18next";
import { createMenu } from "../components/UI/Menu";
import { Scenes } from "../constants";
import { transition } from "../anims/SceneTransitions";

export class Pause extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.pause });
  }
  create() {
    this.cameras.main.setBackgroundColor("rgba(0, 0, 0, 0.8)");

    createMenu(
      this.scale.width / 2,
      this.scale.height / 2 - 250,
      [
        { label: t("Resume"), onClick: this.handleResume, isMain: true },
        { label: t("Restart"), onClick: this.handleRestart },
        { label: t("Options"), onClick: this.handleOptions },
        { label: t("Back to Menu"), onClick: this.handleBackToMenu },
      ],
      this,
      false
    );
  }

  handleResume() {
    this.scene.resume(Scenes.game);
    this.scene.stop();
  }
  handleRestart() {
    transition("fadeOut", this, () => {
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.game);
    });
  }
  handleBackToMenu() {
    transition("fadeOut", this, () => {
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.start);
    });
  }
  handleOptions() {
    // console.log("handle options")
  }
}
