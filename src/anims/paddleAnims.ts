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
    key: "paddleGetsLonger",
    frames: anims.generateFrameNumbers("paddleGetsLonger", {
      start: 0,
      end: 13,
    }),
    frameRate: 50,
  });
};
