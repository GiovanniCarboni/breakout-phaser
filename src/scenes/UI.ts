import { Scenes, Fonts, Sprites } from "../constants";
import { sceneEvents } from "../events/EventCenter";
import { createPauseButton } from "../components/UI/button/PauseButton";
import { t } from "i18next";

export class UI extends Phaser.Scene {
  private hearts!: Phaser.GameObjects.Group;
  private stageText!: Phaser.GameObjects.Text;
  canvasW!: number;
  canvasH!: number;
  constructor() {
    super({
      key: Scenes.ui,
    });
  }

  create() {
    this.scene.moveBelow(Scenes.pause);
    this.scene.moveBelow(Scenes.gameOver);
    this.scene.moveBelow(Scenes.LevelEditor);
    this.scene.moveBelow(Scenes.winGame);
    this.scene.moveAbove(Scenes.game);

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    //////////////// LIVES /////////////////////////////////////
    sceneEvents.on("livesChanged", (lives: number) => {
      this.hearts?.destroy(true, false);
      this.createHearts(lives);
    });

    /////////////// LEVEL NUMBER ///////////////////////////////
    this.stageText = this.add.text(this.canvasW / 2, 27, `${t("Stage")} 1`, {
      fontFamily: Fonts.manaspace,
    });
    this.stageText.setOrigin(0.5, 0.5);

    sceneEvents.on("levelChanged", (level: number) => {
      if (!level) this.stageText.setText("Custom Level");
      else this.stageText.setText(`${t("Stage")} ${level}`);
    });

    ////////////// PAUSE BUTTON ////////////////////////////////
    createPauseButton(this.canvasW - 60, 25, this.handlePause, this);
  }

  handlePause() {
    if (!this.scene.isActive(Scenes.game)) return;
    this.scene.moveBelow(Scenes.pause);
    this.scene.pause(Scenes.game);
    this.scene.launch(Scenes.pause);
  }

  createHearts(lives: number) {
    this.hearts = this.add.group();
    for (let i = 0; i < lives; i++) {
      this.hearts.add(this.add.sprite(60 + 40 * i, 30, Sprites.heart));
    }
  }
}
