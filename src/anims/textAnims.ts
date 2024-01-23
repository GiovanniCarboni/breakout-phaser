import { Anims, Sprites } from "../constants";

export const createTextAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: Anims.gameOver,
    frames: anims.generateFrameNumbers(Sprites.gameOver, {
      start: 0,
      end: 1,
    }),
    frameRate: 6,
    repeat: -1,
  });
  anims.create({
    key: Anims.playButtonIdle,
    frames: anims.generateFrameNumbers(Sprites.playButton, {
      start: 0,
      end: 0,
    }),
    frameRate: 1,
    repeat: 0,
  });
  anims.create({
    key: Anims.playButtonPressed,
    frames: anims.generateFrameNumbers(Sprites.playButton, {
      start: 1,
      end: 1,
    }),
    frameRate: 1,
    repeat: 0,
  });
  anims.create({
    key: Anims.playButtonHover,
    frames: anims.generateFrameNumbers(Sprites.playButton, {
      start: 2,
      end: 2,
    }),
    frameRate: 1,
    repeat: 0,
  });
};
