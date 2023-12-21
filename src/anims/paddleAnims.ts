export const createPaddleAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: "paddle",
    frames: anims.generateFrameNumbers("paddle", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: "longPaddle",
    frames: anims.generateFrameNumbers("longPaddle", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: "shortPaddle",
    frames: anims.generateFrameNumbers("shortPaddle", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
  anims.create({
    key: "paddleGetsLonger1",
    frames: anims.generateFrameNumbers("paddleGetsShorter", {
      start: 14,
      end: 0,
    }),
    frameRate: 60,
  });
  anims.create({
    key: "paddleGetsLonger2",
    frames: anims.generateFrameNumbers("paddleGetsLonger", {
      start: 0,
      end: 13,
    }),
    frameRate: 60,
  });
  anims.create({
    key: "paddleGetsShorter2",
    frames: anims.generateFrameNumbers("paddleGetsLonger", {
      start: 13,
      end: 0,
    }),
    frameRate: 60,
  });
  anims.create({
    key: "paddleGetsShorter1",
    frames: anims.generateFrameNumbers("paddleGetsShorter", {
      start: 0,
      end: 14,
    }),
    frameRate: 60,
  });
};
