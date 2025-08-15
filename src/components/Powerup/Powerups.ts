import { Sprites, StorageKeys } from "../../constants"
import { storage } from "../../utils/gneral"
import Powerup from "./Powerup"

export default class Powerups extends Phaser.Physics.Arcade.Group {
  private powerups = [
    { sprite: Sprites.speedUpBall, desc: 'Fast Ball' },
    { sprite: Sprites.loseLife, desc: 'Kill Paddle' },
    { sprite: Sprites.shrinkPaddle, desc: 'Shrink Paddle' },
    { sprite: Sprites.getLife, desc: 'Extra Life' },
    { sprite: Sprites.expandPaddle, desc: 'Expand Paddle' },
    { sprite: Sprites.igniteBall, desc: 'FireBall' },
    { sprite: Sprites.addShooter, desc: 'Shooting Paddle' },
    { sprite: Sprites.holdBall, desc: 'Hold Ball' },
  ]

  constructor(scene: Phaser.Scene, config: any) {
    super(scene.physics.world, config)
  }

  addPowerup(powerup: Powerup, velocity: { x: number; y: number }) {
    this.add(powerup)
    powerup.init({
      x: velocity.x,
      y: velocity.y,
    })
  }

  getAll() {
    return this.powerups
  }

  getRandomPowerup() {
    // return this.powerups[2].sprite
    const randomPowerup = this.powerups[Math.floor(Math.random() * this.powerups.length)].sprite
    const discoveredPowerups = storage.get(StorageKeys.discoveredPowerups) || []
    if (!discoveredPowerups.find((x: string) => x === randomPowerup)) {
      storage.set(StorageKeys.discoveredPowerups, [...discoveredPowerups, randomPowerup])
    }
    return randomPowerup
  }
}

export const createPowerups = function (scene: Phaser.Scene) {
  const powerups = new Powerups(scene, { classType: Powerup })
  return powerups
}
