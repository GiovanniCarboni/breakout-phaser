import { t } from "i18next";
import { Fonts, Scenes, Sprites, StorageKeys } from "../constants";
import { createSmallButton } from "../components/UI/button/SmallButton";
import { createPowerups } from "../components/Powerup/Powerups";
import { storage } from "../utils/gneral";

export class Powerups extends Phaser.Scene {

  constructor() {
    super({ key: Scenes.powerups })
  }

  create() {
    this.cameras.main.setBackgroundColor("#110702");
    this.createHeader()
    this.createBackBtn()
    this.createPowerups()
  }

  createHeader() {
    this.add.text(this.scale.width / 2, 50, t('Power-Ups'), {
      fontFamily: Fonts.manaspace,
      fontSize: 30,
    }).setOrigin(0.5, 0.5)
  }

  createPowerups() {
    const powerups = createPowerups(this).getAll()
    const discoveredPowerups = storage.get(StorageKeys.discoveredPowerups) || []
    if (powerups.length > discoveredPowerups.length) this.createMoreToDiscoverMsg()
    const columns = 2
    const startX = 135
    const startY = 180
    powerups.forEach((powerup, i) => {
      const row = Math.floor(i / columns)
      const col = i % columns
      const x = startX + col * (this.scale.width / 2 - 100)
      const y = startY + row * 100
      const isDiscovered = discoveredPowerups.includes(powerup.sprite)
      this.add
        .sprite(x, y + 5, isDiscovered ? powerup.sprite : Sprites.notYetDiscovered)
        .setScale(1.4, 1.4)
      this.add
        .text(x + 60, y, isDiscovered ? t(powerup.desc) : t('Not yet discovered'), { 
          fontFamily: Fonts.manaspace,
          fontSize: 16
        })
    })
  }

  createMoreToDiscoverMsg() {
    const msg = t("Play more to discover all power-ups")
    this.add.text(this.scale.width / 2, 100, msg, {
      fontFamily: Fonts.manaspace,
      fontSize: 20
    }).setOrigin(0.5, 0.5)
  }

  createBackBtn() {
    createSmallButton(135, 50, t('Back'), this.handleBack, this)
  }

  handleBack() {
    this.scene.stop()
    this.scene.start(Scenes.start)
  }

}