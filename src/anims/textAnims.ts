export const createTextAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: "gameOver",
    frames: anims.generateFrameNumbers("gameOver", {
      start: 0,
      end: 1,
    }),
    frameRate: 6,
    repeat: -1,
  });
};
