import { sceneEvents } from "../events/EventCenter";

export class UIScene extends Phaser.Scene {
  private pauseBtn!: Phaser.GameObjects.Sprite;
  private hearts!: Phaser.GameObjects.Group;
  canvasW!: number;
  canvasH!: number;
  constructor() {
    super({
      key: "UIScene",
    });
  }

  create() {
    this.scene.moveBelow("PauseScene");
    this.scene.moveBelow("StartScene");

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    ////////////// PAUSE BUTTON ////////////////////////////////
    this.pauseBtn = this.add
      .sprite(this.canvasW - 60, 30, "pause-btn")
      .setInteractive();
    // pause button event listeners
    this.pauseBtn.on("pointerover", () => {
      this.pauseBtn.setScale(1.1);
      this.pauseBtn.angle = -2;
      setTimeout(() => {
        this.pauseBtn.angle = 2;
      }, 100);
    });
    this.pauseBtn.on("pointerout", () => {
      this.pauseBtn.setScale(1);
      setTimeout(() => {
        this.pauseBtn.angle = 0;
      }, 100);
    });
    this.pauseBtn.on("pointerdown", () => {
      this.pause(this.scene);
    });

    //////////////// LIVES /////////////////////////////////////
    sceneEvents.on("livesChanged", (lives: number) => {
      this.hearts?.destroy(true, false);
      this.hearts = this.add.group();
      this.createHearts(lives);
    });
  }

  pause(scene: Phaser.Scenes.ScenePlugin) {
    scene.moveBelow("PauseScene");
    scene.pause();
    scene.pause("GameScene");
    scene.launch("PauseScene");
  }

  createHearts(lives: number) {
    for (let i = 0; i < lives; i++) {
      this.hearts.add(this.add.sprite(60 + 40 * i, 30, "heart"));
    }
  }
}
