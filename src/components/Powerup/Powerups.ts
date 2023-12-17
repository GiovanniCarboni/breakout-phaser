import Powerup, { createPowerup } from "./Powerup";

export default class Powerups extends Phaser.Physics.Arcade.Group {
  constructor(scene: Phaser.Scene, config: any) {
    super(scene.physics.world, config);
  }

  addPowerup(config: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
  }) {
    const powerup = createPowerup(
      this.scene,
      config.position.x,
      config.position.y
    );
    this.add(powerup);
    powerup.init({
      x: config.position.x,
      y: config.position.y,
    });
  }
}

export const createPowerups = function (scene: Phaser.Scene) {
  const powerups = new Powerups(scene, { classType: Powerup });
  return powerups;
};
