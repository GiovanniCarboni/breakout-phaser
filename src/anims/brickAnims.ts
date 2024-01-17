import { Anims, Sprites } from "../constants";

export const createBricksAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: Anims.commonBrick,
    frames: anims.generateFrameNumbers(Sprites.commonBrick, {
      start: 0,
      end: 0,
    }),
    frameRate: 1,
    repeat: 1,
  });
  anims.create({
    key: Anims.fireBrick,
    frames: anims.generateFrameNumbers(Sprites.fireBrick, {
      start: 0,
      end: 4,
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: Anims.metalBrick,
    frames: anims.generateFrameNumbers(Sprites.metalBrick, {
      start: 0,
      end: 0,
    }),
    frameRate: 8,
    repeat: -1,
  });
};
