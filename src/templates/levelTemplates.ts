const levels = require("./levels.json");

export interface LevelTemplate {
  layout: number[][];
  info: {
    width: number;
    height: number;
    offset: {
      top: number;
      left: number;
    };
    padding: number;
  };
}

// leave side columns empty!
export const getLevelTemplate = (
  level: number,
  template?: number[][]
): LevelTemplate => {
  const info = {
    width: 51,
    height: 20,
    offset: {
      top: 80,
      left: 65,
    },
    padding: 2.7,
  };

  let layout: number[][] = [];

  if (level) {
    layout = levels[`level-${level}`];
    if (level === 9) layout = levels["blank-template"];
    if (!layout) layout = levels["test"];
  }
  if (template) {
    layout = template;
  }

  return {
    layout,
    info,
  };
};
