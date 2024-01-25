import { createMenu } from "../components/UI/Menu";
import { Scenes } from "../constants";

export class Pause extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.pause });
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("rgba(0, 0, 0, 0.8)");

    createMenu(
      this.scale.width / 2,
      this.scale.height / 2 - 250,
      [
        { label: "Resume", onClick: this.handleResume, isMain: true },
        { label: "Restart", onClick: this.handleRestart },
        { label: "Options", onClick: this.handleOptions },
        { label: "Back to Menu", onClick: this.handleBackToMenu },
      ],
      this,
      false
    );
  }

  handleResume() {
    this.scene.resume(Scenes.game);
    this.scene.stop();
  }
  handleRestart() {
    this.scene.stop(Scenes.game);
    this.scene.start(Scenes.game);
  }
  handleBackToMenu() {
    this.scene.stop(Scenes.game);
    this.scene.start(Scenes.start);
  }
  handleOptions() {
    // console.log("handle options")
  }
}
