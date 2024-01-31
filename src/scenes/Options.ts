import { t } from "i18next";
import { transition } from "../anims/SceneTransitions";
import { createBackButton } from "../components/UI/BackButton";
import { Fonts, Scenes, Sprites } from "../constants";
import LanguageSelector, {
  createLanguageSelector,
} from "../components/UI/LanguageSelector";

export class Options extends Phaser.Scene {
  private fromScene!: string;
  private languageSelector!: LanguageSelector;
  private bar!: Phaser.GameObjects.Sprite;
  private nob!: Phaser.GameObjects.Sprite;
  private volumeFill!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: Scenes.options });
  }

  init({ fromScene }: { fromScene: string }) {
    this.fromScene = fromScene;
  }

  create() {
    // transition("fadeIn", this);
    this.cameras.main.setBackgroundColor("#000");

    /////// HEADING /////////////////////////////////////////////
    this.add
      .text(this.scale.width / 2, 120, t("Options"), {
        fontFamily: Fonts.manaspace,
        fontSize: 30,
      })
      .setOrigin(0.5, 0.5);

    /////// MENU FRAME /////////////////////////////////////////////
    this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 2 - 10,
        Sprites.optionsBox
      )
      .setDepth(-1);

    /////// BACK BUTTON /////////////////////////////////////////////
    createBackButton(
      120,
      this.scale.height - 140,
      () => {
        transition("fadeOut", this, () => {
          this.scene.stop();
          this.scene.start(this.fromScene);
        });
      },
      this
    );

    /////// LANGUAGE SELECTOR /////////////////////////////////////////////
    this.initLanguageSelector();

    /////// VOLUME SLIDER /////////////////////////////////////////////
    this.initVolumeSlider();
  }

  update() {
    // update volume fill
    this.volumeFill.width = this.nob.x - this.volumeFill.x;
  }

  /////// LANGUAGE SELECTOR /////////////////////////////////////////////
  initLanguageSelector() {
    const label = this.add
      .text(this.scale.width / 2 - 120, 280, t("Language"), {
        fontFamily: Fonts.manaspace,
      })
      .setOrigin(1, 0.5);

    this.languageSelector = createLanguageSelector(
      label.x + 160,
      label.y,
      this,
      () => {
        this.languageSelector.save();
        this.scene.stop().start();
      }
    );
  }

  /////// VOLUME SLIDER /////////////////////////////////////////////
  initVolumeFill() {
    /////// dynamic fill /////////////////////////////////////////////
    this.volumeFill = this.add
      .rectangle()
      .setOrigin(0, 0)
      .setX(this.bar.x - this.bar.width / 2 + 15)
      .setY(this.bar.y - 3)
      .setFillStyle(0x916857);
    this.volumeFill.width = this.nob.x - this.volumeFill.x;
    this.volumeFill.height = this.bar.height - 4;
  }

  initVolumeSlider() {
    /////// text label /////////////////////////////////////////////
    const label = this.add
      .text(this.scale.width / 2 - 120, 460, t("Volume"), {
        fontFamily: Fonts.manaspace,
      })
      .setOrigin(1, 0.5)
      .setInteractive()
      .on("pointerdown", () => {
        if (this.sound.volume > 0) {
          this.sound.volume = 0;
        } else {
          this.sound.volume = 1;
        }
        this.scene.stop().start();
      });

    /////// volume bar /////////////////////////////////////////////
    this.bar = this.add
      .sprite(label.x + 160, label.y, Sprites.volumeBar)
      .setInteractive()
      .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer.x < barEndX && pointer.x > barStartX) {
          this.nob.x = pointer.x;
          const position =
            (this.nob.x - (this.bar.x - this.bar.width / 2)) / this.bar.width;
          let volume = Math.round(position * 1000) / 1000;
          if (position < 0.1) volume = 0;
          if (position > 0.9) volume = 1;
          this.sound.volume = volume;
        }
      });
    const barStartX = this.bar.x - this.bar.width / 2 + 15;
    const barEndX = this.bar.x + this.bar.width / 2 - 15;

    /////// volume knob /////////////////////////////////////////////
    const nobX =
      this.bar.x - this.bar.width / 2 + this.sound.volume * this.bar.width >=
      barEndX
        ? barEndX
        : this.bar.x -
            this.bar.width / 2 +
            this.sound.volume * this.bar.width <=
          barStartX
        ? barStartX
        : this.bar.x - this.bar.width / 2 + this.sound.volume * this.bar.width;

    this.nob = this.add
      .sprite(nobX, label.y, Sprites.volumeNob)
      .setInteractive()
      .setDepth(2);

    /////// volume fill /////////////////////////////////////////////
    this.initVolumeFill();

    /////// knob listeners /////////////////////////////////////////////
    this.nob.on("pointerdown", () => {
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown && pointer.x < barEndX && pointer.x > barStartX) {
          this.nob.x = pointer.x;
          const position =
            (this.nob.x - (this.bar.x - this.bar.width / 2)) / this.bar.width;
          let volume = Math.round(position * 1000) / 1000;
          if (position < 0.1) volume = 0;
          if (position > 0.9) volume = 1;
          this.sound.volume = volume;
        }
      });
    });

    this.input.on("pointerup", () => {
      this.input.off("pointermove");
      // save volume to local storage
      localStorage?.setItem(
        "Volume",
        (Math.round(this.sound.volume * 1000) / 1000).toString()
      );
      // this.volumeFill.width = this.nob.x - this.volumeFill.x;
    });
  }
}
