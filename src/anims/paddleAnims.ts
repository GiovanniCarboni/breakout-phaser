export const createPaddleAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: "paddleAnimation",
    frames: anims.generateFrameNumbers("paddle", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
};
