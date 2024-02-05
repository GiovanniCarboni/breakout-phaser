import { t } from "i18next";
import Brick from "../components/brick/Brick";
import Bricks, { createBricks } from "../components/brick/Bricks";
import { createSmallButton } from "../components/UI/button/SmallButton";
import { createClearButton } from "../components/UI/button/ClearButton";
import { Anims, Fonts, Scenes, Sounds, Sprites } from "../constants";
import { transition } from "../anims/sceneTransitions";

export class LevelEditor extends Phaser.Scene {
  private levelId?: number;
  private slots!: Bricks;
  private clearButton!: Phaser.GameObjects.Sprite;
  private playButton!: Phaser.GameObjects.Sprite;
  private selectedBrick?: Phaser.GameObjects.Sprite;
  private brickHighlight?: Phaser.GameObjects.Sprite;
  private message?: Phaser.GameObjects.Text;
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };

  constructor() {
    super({ key: Scenes.LevelEditor });
  }

  //////////////////////////////////////////////////////////////
  ////// INIT
  init(data: { id: number; template: number[][] }) {
    this.selectedBrick = undefined;

    // there no incoming template (blank page)
    if (!data.template && !data.id) {
      this.slots = createBricks(this, 9);
      this.levelId = Date.now();
      // there is an incoming template
    } else {
      this.levelId = data.id;
      this.slots = createBricks(
        this,
        undefined,
        data.template.map((row, i) =>
          row.map((num, j) => {
            if (i === 0) return 0;
            if (j === 0) return 0;
            if (j === 18) return 0;
            return num === 0 ? 9 : num;
          })
        )
      );
    }
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE
  create() {
    transition("fadeIn", this);

    // set background color
    this.cameras.main.setBackgroundColor("#110702");

    // remove menu on right click
    this.input.mouse?.disableContextMenu();

    // init elements
    this.initBrickSelector();
    this.initPlayButton();

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

    //////////////////////////////////////////////////////////////
    ////// SOUND
    this.sounds = {
      shuffle: this.sound.add(Sounds.shuffle, { loop: false, volume: 0.2 }),
      btnPressed: this.sound.add(Sounds.buttonPress, {
        loop: false,
        volume: 0.2,
      }),
      select: this.sound.add(Sounds.brickbreak, {
        loop: false,
        volume: 0.2,
      }),
    };

    //////////////////////////////////////////////////////////////
    ////// BACK BUTTON
    createSmallButton(135, 50, t("Back"), this.handleBack, this);

    //////////////////////////////////////////////////////////////
    ////// CLEAR BUTTON
    this.clearButton = createClearButton(
      205,
      50,
      this.handleClear,
      this
    ).setVisible(false);

    //////////////////////////////////////////////////////////////
    ////// SELECT SLOT
    this.slots.children.each((slot) => {
      slot.on(
        "pointerover",
        (pointer: Phaser.Input.Pointer) => this.handleSelectSlot(pointer, slot),
        this
      );
      slot.on(
        "pointerdown",
        (pointer: Phaser.Input.Pointer) => this.handleSelectSlot(pointer, slot),
        this
      );
      return true;
    });

    //////////////////////////////////////////////////////////////
    ////// SAVE BUTTON
    createSmallButton(
      this.scale.width - 135,
      50,
      t("Save"),
      this.handleSave,
      this
    );
  }

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  update() {
    this.slots.children.each((slotObj) => {
      const slot = slotObj as Brick;
      if (slot.texture.key !== Sprites.blankBrick) {
        this.clearButton.setVisible(true);
        return false;
      }
      this.clearButton.setVisible(false);
      return true;
    });
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE BACK
  handleBack() {
    const savedData = localStorage?.getItem("createdLevels");
    transition("fadeOut", this, () => {
      if (savedData) {
        this.scene.start(Scenes.createdLevels);
        this.scene.stop();
      } else {
        this.scene.start(Scenes.start);
        this.scene.stop();
      }
    });
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE CLEAR
  handleClear() {
    this.slots.children.each((slotObj) => {
      const slot = slotObj as Brick;
      if (slot.anims.isPlaying) slot.anims.stop();
      if (slot.texture.key !== Sprites.blankBrick)
        slot.setTexture(Sprites.blankBrick);
      return true;
    });
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE SAVE
  handleSave() {
    if (!this.canSave()) return;
    this.saveToStorage();
    this.handleBack();
  }

  //////////////////////////////////////////////////////////////
  ////// MESSAGE IF CAN'T SAVE/PLAY
  canSave(): boolean {
    const template: number[][] = Bricks.getTemplateFromBricks(this.slots);
    if (!template.flat().some((brick) => brick !== 0 && brick !== 3)) {
      this.cameras.main.shake(100, 0.005);
      if (this.message) return false;
      this.message = this.add
        .text(
          this.scale.width - 120,
          this.scale.height - 170,
          t("Template must contain at least one breakable brick"),
          { fontFamily: Fonts.manaspace }
        )
        .setOrigin(1, 0);
      setTimeout(() => {
        this.message!.destroy();
        this.message = undefined;
      }, 3000);
      return false;
    }
    return true;
  }

  //////////////////////////////////////////////////////////////
  ////// SAVE TO LOCAL STORAGE
  saveToStorage() {
    const data = localStorage?.getItem("createdLevels");

    // if no levels in local storage
    if (!data) {
      localStorage?.setItem(
        "createdLevels",
        JSON.stringify([
          {
            id: Date.now(),
            template: Bricks.getTemplateFromBricks(this.slots),
          },
        ])
      );
      // if there are levels in local storage
    } else {
      const savedLevels: { id: number; template: number[][] }[] =
        JSON.parse(data);
      let existingLevelIndex;
      const existingLevel = savedLevels.find((level, i) => {
        if (level.id === this.levelId) existingLevelIndex = i;
        return level.id === this.levelId;
      });
      // if current level exists already (by id)
      if (data && existingLevel && existingLevelIndex !== null) {
        savedLevels[existingLevelIndex!].template =
          Bricks.getTemplateFromBricks(this.slots);
        localStorage?.setItem("createdLevels", JSON.stringify(savedLevels));
        // if this is a new level
      } else {
        localStorage?.setItem(
          "createdLevels",
          JSON.stringify([
            ...savedLevels,
            {
              id: this.levelId,
              template: Bricks.getTemplateFromBricks(this.slots),
            },
          ])
        );
      }
    }
  }

  //////////////////////////////////////////////////////////////
  ////// SELECT SLOT
  handleSelectSlot(
    pointer: Phaser.Input.Pointer,
    slot: Phaser.GameObjects.GameObject
  ) {
    const selectedSlot = slot as Brick;
    if (pointer.leftButtonDown()) {
      if (this.selectedBrick) {
        if (selectedSlot.anims?.isPlaying) selectedSlot.anims.stop();
        if (this.selectedBrick.anims?.isPlaying) {
          selectedSlot.play(this.selectedBrick.anims.currentAnim!);
        } else selectedSlot.setTexture(this.selectedBrick.texture.key);
      }
    } else if (pointer.rightButtonDown()) {
      if (selectedSlot.anims.isPlaying) selectedSlot.anims.stop();
      selectedSlot.setTexture(Sprites.blankBrick);
    }
  }

  //////////////////////////////////////////////////////////////
  ////// PLAY BUTTON
  initPlayButton() {
    this.playButton = this.add
      .sprite(
        this.scale.width - 162,
        this.scale.height - 89,
        Sprites.playButton
      )
      .play(Anims.playButtonIdle)
      .setInteractive();

    // play handlers
    const playDown = () => {
      this.playButton.play(Anims.playButtonPressed);
    };
    const playUp = () => {
      this.startGame();
    };
    const playOver = (pointer: Phaser.Input.Pointer) => {
      this.playButton.play(Anims.playButtonHover);
      if (pointer.isDown) this.playButton.play(Anims.playButtonPressed);
    };
    const playOut = () => {
      this.playButton.play(Anims.playButtonIdle);
    };

    // play listeners
    this.playButton
      .on("pointerdown", playDown)
      .on("pointerup", playUp)
      .on("pointerout", playOut)
      .on("pointerover", (pointer: Phaser.Input.Pointer) => {
        playOver(pointer);
      });
  }

  //////////////////////////////////////////////////////////////
  ////// START GAME
  startGame() {
    if (!this.canSave()) return;
    const template: number[][] = Bricks.getTemplateFromBricks(this.slots);
    this.saveToStorage();
    transition("fadeOut", this, () => {
      this.scene.start(Scenes.game, { isCustom: true, template });
      this.scene.stop();
    });
  }

  //////////////////////////////////////////////////////////////
  ////// BRICK SELECTOR
  initBrickSelector() {
    this.add
      .sprite(0, this.scale.height, Sprites.brickSelector)
      .setOrigin(0, 1)
      .setDepth(-1);
    // CREATE SELECTABLE BRICKS
    const commonBrick = this.add.sprite(
      160,
      this.scale.height - 110,
      Sprites.commonBrick
    );
    const fireBrick = this.add
      .sprite(160, this.scale.height - 70, Sprites.fireBrick)
      .play(Anims.fireBrick);
    const metalBrick = this.add.sprite(
      240,
      this.scale.height - 110,
      Sprites.metalBrick
    );
    for (let brick of [commonBrick, fireBrick, metalBrick]) {
      brick.setInteractive();
      brick.setOrigin(0.5, 0.5);
    }

    // SELECT BRICK
    commonBrick.on(
      "pointerdown",
      () => {
        this.handleSelectBrick(commonBrick, Sprites.commonBrick);
      },
      this
    );
    fireBrick.on(
      "pointerdown",
      () => {
        this.handleSelectBrick(fireBrick, Sprites.fireBrick);
      },
      this
    );
    metalBrick.on(
      "pointerdown",
      () => {
        this.handleSelectBrick(metalBrick, Sprites.metalBrick);
      },
      this
    );

    // UNSELECT BRICK
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() && this.selectedBrick) {
        this.selectedBrick.destroy();
        this.brickHighlight?.destroy();
        this.selectedBrick = undefined;
      }
    });
  }

  handleSelectBrick(brick: Phaser.GameObjects.Sprite, sprite: string) {
    this.sounds.select.play();
    if (this.brickHighlight) this.brickHighlight.destroy();
    if (this.selectedBrick) this.selectedBrick.destroy();
    this.brickHighlight = Brick.createHighlight(brick.x, brick.y, this);
    this.selectedBrick = this.add.sprite(brick.x + 8, brick.y + 5, sprite);
    if (sprite === "fireBrick") this.selectedBrick.play(Anims.fireBrick);
    this.input.off("pointermove");
    this.input.on("pointermove", this.handleMoveBrick, this);
  }

  handleMoveBrick(pointer: Phaser.Input.Pointer) {
    this.selectedBrick?.setX(pointer.x);
    this.selectedBrick?.setY(pointer.y);
  }
}
