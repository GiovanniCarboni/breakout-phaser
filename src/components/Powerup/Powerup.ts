export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string
  ) {
    super(scene, x, y, texture, frame)
  }

  init(velocity: { x: number; y: number }) {
    this.setCollideWorldBounds()
    this.setBounce(1)
    this.setVelocity(velocity.x, velocity.y)
  }
}

export const createPowerup = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  texture: string
) => {
  const powerup = new Powerup(scene, x, y, texture)
  scene.add.existing(powerup)
  scene.physics.world.enableBody(powerup, Phaser.Physics.Arcade.DYNAMIC_BODY)
  return powerup
}
