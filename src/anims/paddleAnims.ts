import { Anims, Sprites } from "../constants";

export const createPaddleAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: Anims.defaultPaddle,
    frames: anims.generateFrameNumbers(Sprites.defaultPaddle, {
      start: 0,
      end: 3,
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: Anims.longPaddle,
    frames: anims.generateFrameNumbers(Sprites.longPaddle, {
      start: 0,
      end: 3,
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: Anims.shortPaddle,
    frames: anims.generateFrameNumbers(Sprites.shortPaddle, {
      start: 0,
      end: 3,
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: Anims.paddleGetsLonger1,
    frames: anims.generateFrameNumbers(Sprites.paddletransition1, {
      start: 14,
      end: 0,
    }),
    frameRate: 60,
  });
  anims.create({
    key: Anims.paddleGetsLonger2,
    frames: anims.generateFrameNumbers(Sprites.paddleTransition2, {
      start: 0,
      end: 13,
    }),
    frameRate: 60,
  });
  anims.create({
    key: Anims.paddleGetsShorter1,
    frames: anims.generateFrameNumbers(Sprites.paddletransition1, {
      start: 0,
      end: 14,
    }),
    frameRate: 60,
  });
  anims.create({
    key: Anims.paddleGetsShorter2,
    frames: anims.generateFrameNumbers(Sprites.paddleTransition2, {
      start: 13,
      end: 0,
    }),
    frameRate: 60,
  });
};
