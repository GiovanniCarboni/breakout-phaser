import { Scenes } from "../constants";
import { createMenu } from "../components/UI/Menu";
import { t } from "i18next";
import { transition } from "../anims/sceneTransitions";

export class WinGame extends Phaser.Scene {
  private isCustom!: boolean;
  private canvasH!: number;
  private canvasW!: number;
  constructor() {
    super({ key: Scenes.winGame });
  }

  init({ isCustom }: { isCustom: boolean }) {
    this.canvasH = this.scale.height;
    this.canvasW = this.scale.width;
    if (isCustom) this.isCustom = true;
    else if (!isCustom) this.isCustom = false;
  }

  create() {
    transition("fadeIn", this);

    this.cameras.main.setBackgroundColor("#000");

    this.add
      .text(this.canvasW / 2, 160, "You Win!", {
        fontFamily: "Manaspace",
        fontSize: 52,
      })
      .setColor("#e9e9e9")
      .setOrigin(0.5, 0.5);

    if (this.isCustom) {
      createMenu(
        this.canvasW / 2,
        this.canvasH / 2 - 100,
        [
          { label: t("Restart"), onClick: this.handleRestart, isMain: true },
          { label: t("Back to Editor"), onClick: this.handleBackToEditor },
          { label: t("Back to Menu"), onClick: this.handleBackToMenu },
        ],
        this
      );
    }
    if (!this.isCustom) {
      createMenu(
        this.canvasW / 2,
        this.canvasH / 2,
        [
          { label: "Restart", onClick: this.handleRestart, isMain: true },
          { label: "Back to Menu", onClick: this.handleBackToMenu },
        ],
        this
      );
    }
  }

  handleRestart() {
    transition("fadeOut", this, () => {
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.game);
    });
  }
  handleBackToEditor() {
    // console.log("back to editor");
  }
  handleBackToMenu() {
    transition("fadeOut", this, () => {
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.start);
      this.scene.stop();
    });
  }
}
