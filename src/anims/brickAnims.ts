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
    yoyo: true,
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
  anims.create({
    key: Anims.iceBrickIdle,
    frames: anims.generateFrameNumbers(Sprites.iceBrick, {
      start: 0,
      end: 3,
    }),
    frameRate: 1,
    repeat: -1,
  });
  anims.create({
    key: Anims.iceBrickBreak,
    frames: anims.generateFrameNumbers(Sprites.iceBrick, { start: 4, end: 9 }),
    frameRate: 40,
  });
  anims.create({
    key: Anims.rockBrickBreak,
    frames: anims.generateFrameNumbers(Sprites.rockBrick, {
      start: 3,
      end: 6,
    }),
    frameRate: 40
  })
};
