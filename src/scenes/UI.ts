import { sceneEvents } from "../events/EventCenter";

export class UI extends Phaser.Scene {
  private pauseBtn!: Phaser.GameObjects.Sprite;
  private hearts!: Phaser.GameObjects.Group;
  private stageText!: Phaser.GameObjects.Text;
  canvasW!: number;
  canvasH!: number;
  constructor() {
    super({
      key: "UI",
    });
  }

  create() {
    this.scene.moveBelow("pause");
    this.scene.moveBelow("start");
    this.scene.moveBelow("gameOver");

    this.canvasW = this.scale.width;
    this.canvasH = this.scale.height;

    /////////////// LEVEL NUMBER ///////////////////////////////
    this.stageText = this.add.text(this.canvasW / 2, 15, `Stage 1`);

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
      this.createHearts(lives);
    });

    sceneEvents.on("levelChanged", (level: number) => {
      this.stageText.setText(`Stage ${level}`);
    });
  }

  pause(scene: Phaser.Scenes.ScenePlugin) {
    scene.moveBelow("pause");
    scene.pause();
    scene.pause("game");
    scene.launch("pause");
  }

  createHearts(lives: number) {
    this.hearts = this.add.group();
    for (let i = 0; i < lives; i++) {
      this.hearts.add(this.add.sprite(60 + 40 * i, 30, "heart"));
    }
  }
}
