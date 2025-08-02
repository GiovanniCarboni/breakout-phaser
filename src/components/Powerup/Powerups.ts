import { Sprites } from "../../constants";
import Powerup from "./Powerup";

export default class Powerups extends Phaser.Physics.Arcade.Group {
  private powerups = [
    Sprites.speedUpBall,
    Sprites.loseLife,
    Sprites.getLife,
    Sprites.expandPaddle,
    Sprites.shrinkPaddle,
    Sprites.igniteBall,
    Sprites.addShooter,
  ];

  constructor(scene: Phaser.Scene, config: any) {
    super(scene.physics.world, config);
  }

  addPowerup(powerup: Powerup, velocity: { x: number; y: number }) {
    this.add(powerup);
    powerup.init({
      x: velocity.x,
      y: velocity.y,
    });
  }

  getRandomPowerup() {
    return this.powerups[Math.floor(Math.random() * this.powerups.length)];
  }
}

export const createPowerups = function (scene: Phaser.Scene) {
  const powerups = new Powerups(scene, { classType: Powerup });
  return powerups;
};
