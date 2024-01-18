import { Anims, Sprites } from "../constants";

export const createBricksAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: Anims.commonBrick,
    frames: anims.generateFrameNumbers(Sprites.commonBrick, {
      start: 0,
      end: 4,
    }),
    frameRate: 30,
    repeat: 0,
  });
  anims.create({
    key: Anims.fireBrick,
    frames: anims.generateFrameNumbers(Sprites.fireBrick, {
      start: 0,
      end: 4,
    }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: Anims.metalBrick,
    frames: anims.generateFrameNumbers(Sprites.metalBrick, {
      start: 0,
      end: 4,
    }),
    frameRate: 50,
    repeat: 0,
  });
  anims.create({
    key: Anims.burnBrick,
    frames: anims.generateFrameNumbers(Sprites.burnBrick, {
      start: 0,
      end: 4,
    }),
    frameRate: 20,
    repeat: 0,
  });
};
