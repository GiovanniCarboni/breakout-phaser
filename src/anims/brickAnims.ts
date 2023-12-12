export const createBricksAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: "brickAnimation",
    frames: anims.generateFrameNumbers("brick", {
      start: 0,
      end: 0,
    }),
    frameRate: 1,
    repeat: 1,
  });
  anims.create({
    key: "brickFireAnimation",
    frames: anims.generateFrameNumbers("brickFire", {
      start: 0,
      end: 4,
    }),
    frameRate: 8,
    repeat: -1,
  });
};
