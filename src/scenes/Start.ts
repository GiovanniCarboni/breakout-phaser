import { transition } from "../anims/sceneTransitions";
import { createMenu } from "../components/UI/Menu";
import { Anims, Fonts, Scenes, Sprites } from "../constants";
import t from "../i18next/i18next";

export class Start extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.start });
  }

  create() {
    transition("fadeIn", this);

    this.scene.run(Scenes.ui);
    this.scene.moveAbove(Scenes.ui);

    this.cameras.main.setBackgroundColor("#110702");

    //////////////////////////////////////////////////////////
    ////// GAME FRAME
    this.add.image(0, 0, Sprites.sideBar).setOrigin(0, 0);
    this.add.image(this.scale.width, 0, Sprites.sideBar).setOrigin(1, 0);
    this.add
      .image(0, 0, Sprites.sideBar)
      .setOrigin(1, 0)
      .setRotation(Phaser.Math.DegToRad(-90));
    this.add
      .image(0, this.scale.height, Sprites.sideBar)
      .setOrigin(0, 0)
      .setRotation(Phaser.Math.DegToRad(-90));
    ///////////////////////////////////////////////////////////

    // const titleFrame = this.add
    //   .sprite(this.scale.width / 2, 180, Sprites.titleFrame)
    //   .setScale(2)
    //   .play(Anims.titleFrame);
    // this.add
    //   .text(titleFrame.x, titleFrame.y, "Brick Quest", {
    //     fontFamily: Fonts.manaspace,
    //     fontSize: 34,
    //     strokeThickness: 8,
    //     stroke: "#000",
    //     color: "#e9e9e9",
    //   })
    //   .setOrigin(0.5, 0.5);

    createMenu(
      this.scale.width / 2,
      this.scale.height / 2 - 80,
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
      this.scene.start(Scenes.createdLevels);
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
