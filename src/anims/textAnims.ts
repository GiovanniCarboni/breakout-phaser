import { Anims, Sprites } from "../constants";

export const createTextAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: Anims.gameOver,
    frames: anims.generateFrameNumbers(Sprites.gameOver, {
      start: 0,
      end: 1,
    }),
    frameRate: 6,
    repeat: -1,
  });
};
