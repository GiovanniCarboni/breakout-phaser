import { t } from "i18next";
import { createMenu } from "../components/UI/Menu";
import { Anims, Fonts, Scenes, Sounds, Sprites, StorageKeys } from "../constants";
import { transition } from "../anims/SceneTransitions";
import { storage } from "../utils/gneral";

export class GameOver extends Phaser.Scene {
  isCustom = false
  canvasH!: number
  canvasW!: number
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };

  constructor() {
    super({ key: Scenes.gameOver });
  }

  init({ isCustom }: { isCustom: boolean }) {
    this.canvasH = this.scale.height
    this.canvasW = this.scale.width
    if (isCustom) this.isCustom = true
    else if (!isCustom) this.isCustom = false
  }

  create() {
    transition("fadeIn", this);

    this.cameras.main.setBackgroundColor("#000");

    this.sounds = {
      gameOver: this.sound.add(Sounds.gameOver, { loop: false }),
    };

    this.sounds.gameOver.play();

    this.initGameOverText();

    this.initBestScore()
    createMenu(
      this.scale.width / 2,
      this.isCustom ? this.canvasH / 2 - 60 : this.canvasH / 2,
      this.isCustom ? [
          { label: t("Restart"), onClick: this.handleRestart, isMain: true },
          { label: t("Back to Editor"), onClick: this.handleBackToEditor },
          { label: t("Back to Menu"), onClick: this.handleBackToMenu },
        ]
      : [
        { label: t("Restart"), onClick: this.handleRestart, isMain: true },
        { label: t("Back to Menu"), onClick: this.handleBackToMenu },
      ],
      this
    )
  }

  initBestScore() {
    const bestScore = storage.get(StorageKeys.bestScore)
    if (!bestScore) return
    const labelText = `${t("Best score")}: ${bestScore}`
    const label = this.add
      .text(this.scale.width / 2, 260, labelText, {
        fontFamily: Fonts.manaspace,
        fontSize: 20
      })
      .setOrigin(0.5, 0.5);
  }

  handleRestart() {
    transition("fadeOut", this, () => {
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.game);
    });
  }

  handleBackToEditor() {
    transition("fadeOut", this, () => {
      this.scene.stop(Scenes.game)
      this.scene.start(Scenes.createdLevels)
      this.scene.stop()
    })
  }

  handleBackToMenu() {
    transition("fadeOut", this, () => {
      this.scene.stop(Scenes.game);
      this.scene.start(Scenes.start);
      this.scene.stop();
    });
  }

  initGameOverText() {
    this.add
      .sprite(
        this.scale.width / 2,
        this.scale.height / 2 - 180,
        Sprites.gameOver
      )
      .play(Anims.gameOver);
  }
}
