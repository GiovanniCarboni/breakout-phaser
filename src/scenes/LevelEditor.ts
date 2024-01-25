import { Physics } from "phaser";
import Brick from "../components/Brick/Brick";
import { createBricks } from "../components/Brick/Bricks";
import { createBackButton } from "../components/UI/BackButton";
import { createClearButton } from "../components/UI/ClearButton";
import { Anims, Fonts, Scenes, Sounds, Sprites } from "../constants";

export class LevelEditor extends Phaser.Scene {
  private slots!: Phaser.Physics.Arcade.Group;
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

  init() {
    this.selectedBrick = undefined;
    // should get brick template
  }

  create() {
    // SET BACKGROUND COLOR
    this.cameras.main.setBackgroundColor("#000");

    // remove menu on right click
    this.input.mouse?.disableContextMenu();

    // INIT SOUNDS
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

    // INIT ELEMENTS
    createBackButton(135, 50, () => this.scene.start(Scenes.start), this);
    this.slots = createBricks(this, 9);
    this.initBrickSelector();
    this.initPlayButton();
    this.clearButton = createClearButton(
      205,
      50,
      this.handleClear,
      this
    ).setVisible(false);

    // SELECT SLOT
    this.slots.children.each((slot: any) => {
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
  }

  update() {
    this.slots.children.each((slotObj: Phaser.GameObjects.GameObject) => {
      const slot = slotObj as Brick;
      if (slot.texture.key !== Sprites.blankBrick) {
        this.clearButton.setVisible(true);
        return false;
      }
      this.clearButton.setVisible(false);
      return true;
    });
  }

  handleClear() {
    this.slots.children.each((slotObj: Phaser.GameObjects.GameObject) => {
      const slot = slotObj as Brick;
      if (slot.anims.isPlaying) slot.anims.stop();
      if (slot.texture.key !== Sprites.blankBrick)
        slot.setTexture(Sprites.blankBrick);
      return true;
    });
  }

  handleSelectSlot(pointer: Phaser.Input.Pointer, slot: any) {
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

  initPlayButton() {
    this.playButton = this.add
      .sprite(
        this.scale.width - 162,
        this.scale.height - 89,
        Sprites.playButton
      )
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on(
        "pointerdown",
        () => {
          this.playButton.play(Anims.playButtonPressed);
        },
        this
      )
      .on("pointerup", () => {
        this.startGame();
      })
      .on("pointerover", (pointer: Phaser.Input.Pointer) => {
        this.playButton.play(Anims.playButtonHover);
        if (pointer.isDown) this.playButton.play(Anims.playButtonPressed);
      })
      .on(
        "pointerout",
        () => {
          this.playButton.play(Anims.playButtonIdle);
        },
        this
      );

    this.playButton.play(Anims.playButtonIdle);
  }

  createHighlight(x: number, y: number) {
    return this.add
      .sprite(x, y, Sprites.brickHighlight)
      .setOrigin(0.5, 0.5)
      .setDepth(-1);
  }

  startGame() {
    const bricks: string[] = [];
    this.slots.children.each((brickObj: any) => {
      bricks.push((brickObj as Brick).texture.key);
      return true;
    });

    // create level template from displayed bricks
    const template = [];
    while (bricks.length !== 0) {
      const row = bricks.splice(0, 17).map((brick: string) => {
        if (brick === "commonBrick") return 1;
        if (brick === "fireBrick") return 2;
        if (brick === "metalBrick") return 3;
        if (brick === "blankBrick") return 0;
      });
      template.push([0, ...row, 0]);
    }
    template.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    // if no breakable briks, prevent scene change
    if (!template.flat().some((brick) => brick !== 0 && brick !== 3)) {
      if (this.message) return;
      this.message = this.add
        .text(
          this.scale.width - 120,
          this.scale.height - 170,
          "Template must contain at least one breakable brick",
          { fontFamily: Fonts.manaspace }
        )
        .setOrigin(1, 0);
      setTimeout(() => {
        this.message!.destroy();
        this.message = undefined;
      }, 3000);
      return;
    }
    this.scene.start(Scenes.game, { isCustom: true, template });
    this.scene.stop();

    //////////// debug
    // debug outgoing level template
    // console.log(template)
  }

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
    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        if (pointer.rightButtonDown() && this.selectedBrick) {
          this.selectedBrick.destroy();
          this.brickHighlight?.destroy();
          this.selectedBrick = undefined;
        }
      },
      this
    );
  }

  handleSelectBrick(brick: Phaser.GameObjects.Sprite, sprite: string) {
    this.sounds.select.play();
    if (this.brickHighlight) this.brickHighlight.destroy();
    if (this.selectedBrick) this.selectedBrick.destroy();
    this.brickHighlight = this.createHighlight(brick.x, brick.y);
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
