import { Anims, Sprites } from "../constants";

export const createUiAnims = (anims: Phaser.Animations.AnimationManager) => {
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
  });
  anims.create({
    key: Anims.playButtonPressed,
    frames: anims.generateFrameNumbers(Sprites.playButton, {
      start: 1,
      end: 1,
    }),
  });
  anims.create({
    key: Anims.playButtonHover,
    frames: anims.generateFrameNumbers(Sprites.playButton, {
      start: 2,
      end: 2,
    }),
  });
  anims.create({
    key: Anims.mainButtonIdle,
    frames: anims.generateFrameNumbers(Sprites.mainButton, {
      start: 0,
      end: 0,
    }),
  });
  anims.create({
    key: Anims.mainButtonPressed,
    frames: anims.generateFrameNumbers(Sprites.mainButton, {
      start: 1,
      end: 1,
    }),
  });
  anims.create({
    key: Anims.genericButtonIdle,
    frames: anims.generateFrameNumbers(Sprites.genericButton, {
      start: 0,
      end: 0,
    }),
  });
  anims.create({
    key: Anims.genericButtonPressed,
    frames: anims.generateFrameNumbers(Sprites.genericButton, {
      start: 1,
      end: 1,
    }),
  });
  anims.create({
    key: Anims.backButtonIdle,
    frames: anims.generateFrameNumbers(Sprites.backButton, {
      start: 0,
      end: 0,
    }),
  });
  anims.create({
    key: Anims.backButtonPressed,
    frames: anims.generateFrameNumbers(Sprites.backButton, {
      start: 1,
      end: 1,
    }),
  });
  anims.create({
    key: Anims.clearButtonIdle,
    frames: anims.generateFrameNumbers(Sprites.clearButton, {
      start: 0,
      end: 0,
    }),
  });
  anims.create({
    key: Anims.clearButtonPressed,
    frames: anims.generateFrameNumbers(Sprites.clearButton, {
      start: 1,
      end: 1,
    }),
  });
  anims.create({
    key: Anims.clearButtonHover,
    frames: anims.generateFrameNumbers(Sprites.clearButton, {
      start: 2,
      end: 2,
    }),
  });
};
