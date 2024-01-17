import { Anims, Sprites } from "../constants";

export const createPaddleAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: Anims.defaultPaddle,
    frames: anims.generateFrameNames(Sprites.paddle, {
      start: 1,
      end: 4,
      prefix: "paddle_default_",
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: Anims.longPaddle,
    frames: anims.generateFrameNames(Sprites.paddle, {
      start: 1,
      end: 4,
      prefix: "paddle_long_",
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: Anims.shortPaddle,
    frames: anims.generateFrameNames(Sprites.paddle, {
      start: 1,
      end: 4,
      prefix: "paddle_short_",
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: Anims.paddleGetsLonger1,
    frames: anims.generateFrameNames(Sprites.paddle, {
      start: 15,
      end: 1,
      prefix: "transition1_",
      suffix: ".png",
    }),
    frameRate: 60,
  });
  anims.create({
    key: Anims.paddleGetsLonger2,
    frames: anims.generateFrameNames(Sprites.paddle, {
      start: 1,
      end: 14,
      prefix: "transition2_",
      suffix: ".png",
    }),
    frameRate: 60,
  });
  anims.create({
    key: Anims.paddleGetsShorter1,
    frames: anims.generateFrameNames(Sprites.paddle, {
      start: 1,
      end: 15,
      prefix: "transition1_",
      suffix: ".png",
    }),
    frameRate: 60,
  });
  anims.create({
    key: Anims.paddleGetsShorter2,
    frames: anims.generateFrameNames(Sprites.paddle, {
      start: 14,
      end: 1,
      prefix: "transition2_",
      suffix: ".png",
    }),
    frameRate: 60,
  });

  anims.create({
    key: Anims.shoot,
    frames: anims.generateFrameNumbers(Sprites.cannonShooting, {
      start: 0,
      end: 3,
    }),
    frameRate: 60,
  });
};
