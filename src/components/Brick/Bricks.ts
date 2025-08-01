import { Anims } from "../../constants";
import {
  LevelTemplate, // type
  getLevelTemplate,
} from "../../templates/levelTemplates";
import { sleep } from "../../utils/gneral";
import Brick, { createBrick } from "./Brick";

export default class Bricks extends Phaser.Physics.Arcade.Group {
  constructor(scene: Phaser.Scene, config: any) {
    super(scene.physics.world, config);
  }

  //////////////////////////////////////////////////////////////
  ////// GET NUMBER[][] TEMPLATE FROM BRICKS GROUP
  static getTemplateFromBricks(bricksRepresentation: Bricks) {
    const bricks: string[] = [];
    bricksRepresentation.children.each((brickObj: any) => {
      bricks.push((brickObj as Brick).texture.key);
      return true;
    });

    let template: number[][] = [];
    while (bricks.length !== 0) {
      const row: number[] = bricks.splice(0, 17).map((brick: string) => {
        switch(brick) {
          case "commonBrick": return 1;
          case "fireBrick": return 2;
          case "metalBrick": return 3;
          case "iceBrick": return 4;
          case "blankBrick": return 0;
          default: return 0
        }
      });
      template.push([0, ...row, 0]);
    }
    template.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    return template;
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE BRICKS
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

  //////////////////////////////////////////////////////////////
  ////// DESTROY FIRE BRICKS (CHAIN REACTION)
  async destroyFireBricks(entry: number) {
    const queue: number[] = [];
    const checkedBricks = new Set();
    const bricksToDestroy = [];

    queue.push(entry);
    checkedBricks.add(entry);
    let brickType: string;

    // to make sure the first iteration is always treated as fire brick
    let i = 0;

    while (queue.length > 0) {
      const currentBrickNumber = queue.shift();
      const currentBrick = this.getChildren().find(
        (brick) => brick.getData("number") === currentBrickNumber
      );
      if (currentBrick) {
        brickType = currentBrick.getData("type");
        bricksToDestroy.push(currentBrick);
        if (brickType === "fire" || i === 0) {
          const neighbours = this.getNeighboringBricks(currentBrickNumber!);
          for (const neighbour of neighbours) {
            if (!checkedBricks.has(neighbour)) {
              queue.push(neighbour);
              checkedBricks.add(neighbour);
            }
          }
        } else {
          checkedBricks.add(currentBrick.getData("number"));
        }
      }
      i++;
    }

    for (const brickObj of bricksToDestroy) {
      const brick = brickObj as Phaser.Physics.Arcade.Sprite;
      await sleep(10)
      try {
        brick.play(Anims.burnBrick);
        brick.on("animationcomplete", () => brick.destroy());
      } catch (err) {
        continue;
      }
    }
  }

  //////////////////////////////////////////////////////////////
  ////// GET 8 NEIGHBORING BRICKS
  getNeighboringBricks(fireBrick: number) {
    return [
      fireBrick - 1,
      fireBrick + 1,
      fireBrick - 20,
      fireBrick - 19,
      fireBrick - 18,
      fireBrick + 18,
      fireBrick + 19,
      fireBrick + 20,
    ];
  }
}

export const createBricks = function (
  scene: Phaser.Scene,
  level?: number,
  template?: number[][],
  info?: any
) {
  const bricks = new Bricks(scene, { classType: Brick });
  if (level) bricks.fillBricks(scene, getLevelTemplate(level));
  // use custom level
  else bricks.fillBricks(scene, getLevelTemplate(0, template, info));
  return bricks;
};
