import { Anims, Sprites } from "../constants"

export const createBallAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: Anims.fireBall,
    frames: anims.generateFrameNumbers(Sprites.fireBall, {
      start: 0,
      end: 7,
    }),
    frameRate: 30,
    repeat: -1,
  })
  anims.create({
    key: Anims.smoke,
    frames: anims.generateFrameNumbers(Sprites.smoke, {
      start: 4,
      end: 0,
    }),
    frameRate: 30,
  })
}
