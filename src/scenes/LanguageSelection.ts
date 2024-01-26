import i18next from "i18next";
import { Fonts, Scenes, Sounds, Sprites } from "../constants";
import { createButton } from "../components/UI/Button";

export class LanguageSelection extends Phaser.Scene {
  private continueButton!: Phaser.GameObjects.Sprite;
  private selectedFlag?: Phaser.GameObjects.Image;
  private highlight!: Phaser.GameObjects.Image;
  private switchSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  constructor() {
    super({ key: Scenes.languageSelection });
  }

  create() {
    this.switchSound = this.sound.add(Sounds.brickbreak, {
      loop: false,
      volume: 0.2,
    });

    ///////// HIGHLIGHT //////////////////////////////////////////////
    this.highlight = this.add
      .image(0, 0, Sprites.flagHighlight)
      .setVisible(false);

    ///////// BOX ///////////////////////////////////////////////////
    const box = this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 2,
        Sprites.languageSelectionBox
      )
      .setDepth(-1);

    ///////// FLAGS ////////////////////////////////////////////////
    const it = this.add
      .image(box.x - box.width / 2 + 90, box.y, Sprites.italian)
      .setInteractive();
    this.addListeners(it, "Italiano");

    const ro = this.add
      .image(box.x - box.width / 2 + 180, box.y, Sprites.romanian)
      .setInteractive();
    this.addListeners(ro, "Romana");

    const en = this.add
      .image(box.x - box.width / 2 + 270, box.y, Sprites.english)
      .setInteractive();
    this.addListeners(en, "English");

    ///////// OK BUTTON /////////////////////////////////////////
    this.continueButton = createButton(
      this.scale.width - 180,
      this.scale.height - 80,
      "Continue",
      this.handleContinue,
      this
    );
  }

  addListeners(flag: Phaser.GameObjects.Image, label: string) {
    let labelEl;
    flag
      .on("pointerover", () => {
        labelEl = this.add
          .text(flag.x, flag.y + 50, label, { fontFamily: Fonts.manaspace })
          .setOrigin(0.5, 0.5);
      })
      .on("pointerout", () => {
        labelEl!.destroy();
      })
      .on("pointerdown", () => {
        this.switchSound.play();
        this.selectedFlag = flag;
        this.highlight.setVisible(true).setX(flag.x).setY(flag.y);
      });
  }

  handleContinue() {
    if (!this.selectedFlag) {
      const message = this.add
        .text(
          this.scale.width - 340,
          this.continueButton.y,
          "Please select a language",
          {
            fontFamily: Fonts.manaspace,
          }
        )
        .setOrigin(1, 0.5);
      setTimeout(() => {
        message.destroy();
      }, 2000);
    } else {
      const langKey = this.selectedFlag.texture.key.slice(0, 2).toLowerCase();
      i18next.changeLanguage(langKey);
      // user might have local storage disabled
      localStorage?.setItem("Language", langKey);
      this.scene.start(Scenes.start);
    }
  }
}
