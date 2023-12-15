import { LevelTemplate, getLevelTemplate } from "./../templates/levelTemplates";
import { createBricksAnims } from "../anims/brickAnims";
import Brick, { createBrick } from "./Brick";

export default class Bricks extends Phaser.Physics.Arcade.Group {
  constructor(scene: Phaser.Scene, config: any) {
    super(scene.physics.world, config);
    createBricksAnims(scene.anims);
  }

  fillBricks(scene: Phaser.Scene, template: LevelTemplate) {
    const { info, layout } = template;
    let entryNr = 0;
    for (let row = 0; row < layout.length; row++) {
      for (let col = 0; col < layout[row].length; col++) {
        if (layout[row][col] !== 0) {
          let brickX = col * (info.width + info.padding) + info.offset.left;
          let brickY = row * (info.height + info.padding) + info.offset.top;
          let newBrick = createBrick(scene, brickX, brickY, {
            type: layout[row][col],
            entryNr,
          });
          this.add(newBrick);
          newBrick.setImmovable(true);
        }
        entryNr++;
      }
    }
  }
}

export const createBricks = function (scene: Phaser.Scene) {
  const sprite = new Bricks(scene, { classType: Brick });
  sprite.fillBricks(scene, getLevelTemplate());
  return sprite;
};
