import { t } from "i18next";
import { transition } from "../anims/SceneTransitions";
import Brick from "../components/Brick/Brick";
import Bricks, { createBricks } from "../components/Brick/Bricks";
import { createSmallButton } from "../components/UI/button/SmallButton";
import Button, { createButton } from "../components/UI/button/Button";
import { Anims, Scenes, Sprites } from "../constants";

export class CreatedLevels extends Phaser.Scene {
  private templates!: { id: number; template: number[][] }[];
  private representation!: Bricks[];
  private currentlyDisplayed = 0;
  private currentLevelId!: number;
  private dots!: Phaser.GameObjects.Group;
  private dotHighlight!: Phaser.GameObjects.Image;
  private deleteButton!: Button;

  constructor() {
    super({ key: Scenes.createdLevels });
  }

  create() {
    //////////////////////////////////////////////////////////////
    ////// SKIP TO EDITOR IF NO SAVED DATA
    const data = localStorage?.getItem("createdLevels");
    if (!data) {
      this.scene.start(Scenes.LevelEditor, {
        id: undefined,
        template: undefined,
      });
      this.scene.stop();
      return;
    } else {
      this.templates = JSON.parse(data);
      this.currentlyDisplayed = 0;
    }

    this.dots = this.add.group({
      classType: Phaser.GameObjects.Image,
    });

    // transition("fadeIn", this);

    this.addDots();

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

    // SET BACKGROUND COLOR
    this.cameras.main.setBackgroundColor("#110702");

    //////////////////////////////////////////////////////////////
    ////// BACK BUTTON
    createSmallButton(
      135,
      50,
      t("Back"),
      () => this.scene.start(Scenes.start),
      this
    );

    //////////////////////////////////////////////////////////////
    ////// LEVELS
    this.setLevels();
    // this.representation = this.templates.map(({ id, template }, i) => {
    //   const bricks = createBricks(this, undefined, template, {
    //     width: 36,
    //     height: 14,
    //     offset: {
    //       top: 120,
    //       left: 210,
    //     },
    //     padding: 2.7,
    //   }).setVisible(false);
    //   if (i === 0) bricks.setVisible(true);
    //   bricks.getChildren().forEach((child) => {
    //     (child as Brick).setScale(0.7);
    //   });
    //   return bricks!;
    // });

    this.initArrowButtons();

    this.currentLevelId = this.templates[0].id;

    //////////////////////////////////////////////////////////////
    ////// BUTTONS
    createButton(
      this.scale.width - 240,
      this.scale.height - 80,
      t("Edit"),
      this.handleEdit,
      this
    );
    createButton(
      this.scale.width / 2,
      this.scale.height - 80,
      t("New"),
      this.handleNew,
      this
    );
    this.deleteButton = createButton(
      240,
      this.scale.height - 80,
      t("Delete"),
      this.handleDelete,
      this
    );
    createButton(
      this.scale.width / 2,
      this.scale.height - 180,
      "Play",
      this.handlePlay,
      this,
      true
    );
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE NEW
  handleNew() {
    if (this.templates.length >= 10) {
      this.cameras.main.shake(100, 0.005);
      return;
    }
    transition("fadeOut", this, () => {
      this.scene.start(Scenes.LevelEditor, {
        id: null,
        template: null,
      });
      this.scene.stop();
    });
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE NEW
  handleEdit() {
    transition("fadeOut", this, () => {
      this.scene.start(
        Scenes.LevelEditor,
        this.templates[this.currentlyDisplayed]
      );
      this.scene.stop();
    });
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE PLAY
  handlePlay() {
    transition("fadeOut", this, () => {
      this.scene.start(Scenes.game, {
        isCustom: true,
        template: this.templates[this.currentlyDisplayed].template,
      });
      this.scene.stop();
    });
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE DELETE
  handleDelete() {
    const savedLevels = localStorage?.getItem("createdLevels");
    if (savedLevels) {
      const newSavedLevels = JSON.parse(savedLevels).filter(
        (level: { id: number }) => level.id !== this.currentLevelId
      );
      if (newSavedLevels.length === 0) {
        localStorage.removeItem("createdLevels");
        this.scene.start(Scenes.start).stop();
      } else {
        localStorage?.setItem("createdLevels", JSON.stringify(newSavedLevels));
        this.scene.start(Scenes.start).stop();
      }
    }
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE LEVEL REPRESENTATIONS
  setLevels() {
    this.representation = this.templates.map(({ id, template }, i) => {
      const bricks = createBricks(this, undefined, template, {
        width: 36,
        height: 14,
        offset: {
          top: 120,
          left: 210,
        },
        padding: 2.7,
      }).setVisible(false);
      if (i === 0) bricks.setVisible(true);
      bricks.getChildren().forEach((child) => {
        (child as Brick).setScale(0.7);
      });
      return bricks!;
    });
  }

  //////////////////////////////////////////////////////////////
  ////// ARROW BUTTONS
  addDots() {
    for (let i = 1; i <= this.templates.length; i++) {
      const x = 210 + i * 40;
      this.dots.get(x, 50, Sprites.dot);
    }
    const firstDot = this.dots.getChildren()[0] as Phaser.GameObjects.Image;
    this.dotHighlight = this.add.image(
      firstDot.x,
      firstDot.y,
      Sprites.dotHighlight
    );
  }

  //////////////////////////////////////////////////////////////
  ////// ARROW BUTTONS
  initArrowButtons() {
    const right = this.add
      .sprite(
        this.scale.width - 100,
        this.scale.height / 2 - 60,
        Sprites.arrowButton
      )
      .setInteractive();
    const left = this.add
      .sprite(100, this.scale.height / 2 - 60, Sprites.arrowButton)
      .setRotation(Phaser.Math.DegToRad(180))
      .setInteractive();

    left.play(Anims.arrowButtonDisabled).setData("disabled", true);
    if (this.representation.length - 1 === 0)
      right.play(Anims.arrowButtonDisabled).setData("disabled", true);

    const defaultBtnY = right.y;

    //////////////////////////////////////////////////////////////
    ////// ARROW BUTTONS HANDLERS
    const handleArrowDown = (
      direction: "back" | "forward",
      button: Phaser.GameObjects.Sprite
    ) => {
      const maxLength = this.representation.length - 1;

      let newlyDisplayed;
      if (direction === "back") newlyDisplayed = this.currentlyDisplayed - 1;
      if (direction === "forward") newlyDisplayed = this.currentlyDisplayed + 1;

      // if switch to next level happens
      if (newlyDisplayed! <= maxLength && newlyDisplayed! >= 0) {
        this.currentlyDisplayed = newlyDisplayed!;
        this.representation.forEach((level) => {
          const group = level as Bricks;
          group.setVisible(false);
        });
        this.representation[this.currentlyDisplayed].setVisible(true);
        this.currentLevelId = this.templates[this.currentlyDisplayed].id;

        const newDot = this.dots.getChildren()[
          this.currentlyDisplayed
        ] as Phaser.GameObjects.Image;
        this.dotHighlight.setX(newDot.x).setY(newDot.y);

        // arrow button UI logic
        button.setY(defaultBtnY + 3);
        right.play(Anims.arrowButtonIdle);
        left.play(Anims.arrowButtonIdle);
        right.setData("disabled", false);
        left.setData("disabled", false);
        if (this.currentlyDisplayed === maxLength) {
          button.setY(defaultBtnY);
          right.play(Anims.arrowButtonDisabled);
          right.setY(defaultBtnY);
          right.setData("disabled", true);
        }
        if (this.currentlyDisplayed === 0) {
          button.setY(defaultBtnY);
          left.play(Anims.arrowButtonDisabled);
          left.setY(defaultBtnY);
          left.setData("disabled", true);
        }
      }
    };
    const handleArrowUp = (button: Phaser.GameObjects.Sprite) => {
      if (button.getData("disabled")) return;
      button.setY(defaultBtnY - 3);
    };
    const handleArrowHover = (button: Phaser.GameObjects.Sprite) => {
      if (button.getData("disabled")) return;
      button.setY(defaultBtnY - 3);
    };
    const handleArrowOut = (button: Phaser.GameObjects.Sprite) => {
      if (button.getData("disabled")) return;
      button.setY(defaultBtnY);
    };

    right.on("pointerover", () => handleArrowHover(right));
    right.on("pointerout", () => handleArrowOut(right));
    right.on("pointerup", () => handleArrowUp(right));
    right.on("pointerdown", () => {
      handleArrowDown("forward", right);
    });
    left.on("pointerover", () => handleArrowHover(left));
    left.on("pointerout", () => handleArrowOut(left));
    left.on("pointerup", () => handleArrowUp(left));
    left.on("pointerdown", () => {
      handleArrowDown("back", left);
    });
  }
}
