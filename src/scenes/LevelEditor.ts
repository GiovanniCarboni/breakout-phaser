import Brick from "../components/Brick/Brick";
import { createBricks } from "../components/Brick/Bricks";
import { Anims, Scenes, Sounds, Sprites } from "../constants";

export class LevelEditor extends Phaser.Scene {
  private slots!: Phaser.Physics.Arcade.Group;
  private backButton!: Phaser.GameObjects.Sprite;
  private playButton!: Phaser.GameObjects.Sprite;
  private selectedBrick?: Phaser.GameObjects.Sprite;
  private brickHighlight?: Phaser.GameObjects.Sprite;
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound;
  };

  constructor() {
    super({ key: Scenes.LevelEditor });
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
    this.initBrickSelector();
    this.initBackButton();
    this.slots = createBricks(this, 9);
    this.initPlayButton();

    // BUTTON ANIMATION
    for (let button of [this.backButton, this.playButton]) {
      button.on("pointerout", () => button.setScale(1), this);
    }

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
      .on("pointerover", () => {
        this.playButton.play(Anims.playButtonHover);
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

  initBackButton() {
    this.backButton = this.add
      .sprite(80, 30, Sprites.back)
      .setOrigin(0.5, 0.5)
      .setInteractive();

    this.backButton.on(
      "pointerdown",
      () => {
        this.sounds.btnPressed.play();
        this.scene.start(Scenes.start);
      },
      this
    );

    this.backButton.on(
      "pointerover",
      () => this.backButton.setScale(1.03),
      this
    );
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

    this.scene.start(Scenes.game, { isCustom: true, template });

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
