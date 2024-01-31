import i18next from "i18next";
import { Fonts, Scenes, Sounds, Sprites } from "../constants";
import { createButton } from "../components/UI/Button";
import { transition } from "../anims/SceneTransitions";
import LanguageSelector, {
  createLanguageSelector,
} from "../components/UI/LanguageSelector";

export class LanguageSelection extends Phaser.Scene {
  private continueButton!: Phaser.GameObjects.Sprite;
  private languageSelector!: LanguageSelector;

  constructor() {
    super({ key: Scenes.languageSelection });
  }

  create() {
    transition("fadeIn", this);

    ///////// BOX ///////////////////////////////////////////////////
    const box = this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 2,
        Sprites.languageSelectionBox
      )
      .setDepth(-1);

    ///////// FLAGS ////////////////////////////////////////////////
    this.languageSelector = createLanguageSelector(box.x, box.y, this);

    ///////// OK BUTTON /////////////////////////////////////////
    this.continueButton = createButton(
      this.scale.width - 180,
      this.scale.height - 80,
      "Continue",
      this.handleContinue,
      this
    );
  }

  handleContinue() {
    if (!this.languageSelector.selectedFlag) {
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
      this.languageSelector.save();
      transition("fadeOut", this, () => {
        this.scene.start(Scenes.start);
      });
    }
  }
}
