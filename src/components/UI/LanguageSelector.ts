import i18next from "i18next";
import { Fonts, Sounds, Sprites, StorageKeys } from "../../constants";
import { storage } from "../../utils/gneral";

export default class LanguageSelector extends Phaser.GameObjects.Group {
  selectedFlag?: Phaser.GameObjects.Sprite;
  private highlight!: Phaser.GameObjects.Image;
  private switchSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  //////////////////////////////////////////////////////////////
  ////// INIT SELECTOR
  init(x: number, y: number, onChange?: () => void) {
    ///////// HIGHLIGHT //////////////////////////////////////////////
    this.highlight = this.scene.add
      .image(0, 0, Sprites.flagHighlight)
      .setVisible(false);

    ////// FLAGS ////////////////////////////////////////////////////
    const it = this.scene.add
      .sprite(x - 90, y, Sprites.italian)
      .setInteractive();
    this.addListeners(it, "Italiano", onChange);
    this.add(it);
    const ro = this.scene.add.sprite(x, y, Sprites.romanian).setInteractive();
    this.addListeners(ro, "Romana", onChange);
    this.add(ro);
    const en = this.scene.add
      .sprite(x + 90, y, Sprites.english)
      .setInteractive();
    this.addListeners(en, "English", onChange);
    this.add(en);

    this.switchSound = this.scene.sound.add(Sounds.brickbreak, {
      loop: false,
      volume: 0.2,
    });

    const savedLanguage = storage.get(StorageKeys.language)
    if (savedLanguage && savedLanguage.match(/(en|ro|it)/)) {
      savedLanguage === "en" && this.selectFlag(en);
      savedLanguage === "ro" && this.selectFlag(ro);
      savedLanguage === "it" && this.selectFlag(it);
    }
  }

  //////////////////////////////////////////////////////////////
  ////// SAVE SELECTION TO LOCAL STORAGE
  save() {
    if (!this.selectedFlag) return;
    const langKey = this.selectedFlag.texture.key.slice(0, 2).toLowerCase();
    i18next.changeLanguage(langKey);
    // user might have local storage disabled
    storage.set(StorageKeys.language, langKey)
  }

  //////////////////////////////////////////////////////////////
  ////// ADD FLAG INPUT LISTENERS
  addListeners(
    flag: Phaser.GameObjects.Sprite,
    label: string,
    onChange?: () => void
  ) {
    let labelEl;
    flag
      .on("pointerover", () => {
        labelEl = this.scene.add
          .text(flag.x, flag.y + 50, label, { fontFamily: Fonts.manaspace })
          .setOrigin(0.5, 0.5);
      })
      .on("pointerout", () => {
        labelEl!.destroy();
      })
      .on("pointerdown", () => {
        this.switchSound.play();
        this.selectFlag(flag);
        if (onChange) onChange();
      });
  }

  //////////////////////////////////////////////////////////////
  ////// SELECT (HIGHLIGHT) FLAG
  selectFlag(flag: Phaser.GameObjects.Sprite) {
    this.selectedFlag = flag;
    this.highlight.setVisible(true).setX(flag.x).setY(flag.y);
  }
}

export const createLanguageSelector = (
  x: number,
  y: number,
  scene: Phaser.Scene,
  onChange?: () => void
) => {
  const languageSelector = new LanguageSelector(scene);
  languageSelector.init(x, y, onChange?.bind(scene));
  return languageSelector;
};
