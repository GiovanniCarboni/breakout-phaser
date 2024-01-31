const transitionDuration = 400;
// let isAlreadyFading = false;

export const transition = (
  transition: "fadeIn" | "fadeOut",
  scene: Phaser.Scene,
  onComplete?: () => void
) => {
  switch (transition) {
    case "fadeIn":
      scene.cameras.main.fadeIn(transitionDuration, 0, 0, 0);
      break;
    case "fadeOut":
      // if (isAlreadyFading) break;
      // isAlreadyFading = true;
      scene.cameras.main.fadeOut(transitionDuration, 0, 0, 0);
      scene.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          // scene.time.delayedCall(300, () => {
          if (onComplete) {
            // isAlreadyFading = false;
            onComplete();
          }
          // });
        }
      );
      break;
  }
};
