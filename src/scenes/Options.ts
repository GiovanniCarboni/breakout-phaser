import { t } from "i18next"
import { transition } from "../anims/SceneTransitions"
import { createSmallButton } from "../components/UI/button/SmallButton"
import { Fonts, Scenes, Sprites, StorageKeys } from "../constants"
import LanguageSelector, {
  createLanguageSelector,
} from "../components/UI/LanguageSelector"
import { storage } from "../utils/gneral"
import { createCheckbox } from "../components/UI/Checkbox"
import { createKeySelector, KeyInfo } from "../components/UI/KeySelector"

export class Options extends Phaser.Scene {
  private fromScene!: string
  private languageSelector!: LanguageSelector
  private bar!: Phaser.GameObjects.Sprite
  private nob!: Phaser.GameObjects.Sprite
  private volumeFill!: Phaser.GameObjects.Rectangle

  constructor() {
    super({ key: Scenes.options })
  }

  init({ fromScene }: { fromScene: string }) {
    this.fromScene = fromScene
  }

  create() {
    // transition("fadeIn", this)
    this.cameras.main.setBackgroundColor("#000")

    const centerBar = this.add.sprite(this.scale.width/2, 160, Sprites.sideBar).setOrigin(0, 0).setDepth(1)
    centerBar.setCrop(0, 0, centerBar.width, 500)

    // Create option elements
    this.setHeaders()
    this.initLanguageSelector()
    this.initVolumeSlider()
    this.initControls()

    // Menu frame
    this.add.image(this.scale.width/2, this.scale.height/2 - 10, Sprites.optionsBox).setDepth(-1)

    // Back button
    createSmallButton(130, 130, t("Back"), () => {
      transition("fadeOut", this, () => {
      this.scene.stop()
      this.scene.start(this.fromScene)
    })}, this)
  }

  update() {
    // update volume fill
    this.volumeFill.width = this.nob.x - this.volumeFill.x
  }

  /////// CONTROLS //////////////////////////////////////////////////////
  initControls() {
    const controls = storage.get(StorageKeys.controls)
    // default keys (in case they werent saved properly in localStorage)
    const defaultKeys = {
      right: { code: "ArrowRight", keyCode: 39 },
      left: { code: "ArrowLeft", keyCode: 37 },
      action: { code: "Space", keyCode: 32 },
    }
    // key change callback (returns weather it wasnt used already)
    const handleKeyChange = (name:string, obj: KeyInfo) => {
      const controls = storage.get(StorageKeys.controls)
      if (Object.values(controls.keys).find((key:any) => key.code === obj.code)) return false
      storage.set(StorageKeys.controls, { ...controls, keys: { ...controls.keys, [name]: obj } })
      return true
    }
    // create key selectors
    const leftKey = createKeySelector(this.scale.width/2+100, 375, "<", (obj) => handleKeyChange("left", obj), controls.keys?.left ?? defaultKeys.left, this)
    const rightKey = createKeySelector(this.scale.width/2+100, 450, ">", (obj) => handleKeyChange("right", obj), controls.keys?.right ?? defaultKeys.right, this)
    const actionKey = createKeySelector(this.scale.width/2+100, 525, t("Action").toLowerCase(), (obj) => handleKeyChange("action", obj), controls.keys?.action ?? defaultKeys.action, this)
    // disable/enable key selectos
    const enableKeySelectors = (enable:boolean) => [rightKey, actionKey, leftKey].forEach(x => x[enable?'enable':'disable']())
    // create "use mouse" checkbox
    const mouseCheckbox = createCheckbox(this.scale.width/2+100, 300, t("Use mouse"), (checked) => {
      storage.set(StorageKeys.controls, { ...controls, useMouse: checked })
      enableKeySelectors(!checked)
    }, controls.useMouse, this)
    enableKeySelectors(!mouseCheckbox.isChecked())
  }

  /////// LANGUAGE SELECTOR /////////////////////////////////////////////
  initLanguageSelector() {
    const label = this.add
      .text(200, 300, t("Language"), {
        fontFamily: Fonts.manaspace,
      })
      .setOrigin(1, 0.5)

    this.languageSelector = createLanguageSelector(
      label.x + 160,
      label.y,
      this,
      () => {
        this.languageSelector.save()
        this.scene.stop().start()
      }
    )
  }

  //////// HEADERS //////////////////////////////////////////////////
  setHeaders() {
    this.add.text(this.scale.width/2, 130, t("Options"), {
      fontFamily: Fonts.manaspace,
      fontSize: 30,
    }).setOrigin(0.5, 0.5)
    this.add.text(this.scale.width*.75, 200, t("Controls"), {
      fontFamily: Fonts.manaspace,
      fontSize: 22
    }).setOrigin(.5, .5)
    this.add.text(this.scale.width*.25, 200, t("General"), {
      fontFamily: Fonts.manaspace,
      fontSize: 22
    }).setOrigin(.5, .5)
  }

  /////// VOLUME SLIDER /////////////////////////////////////////////
  initVolumeFill() {
    /////// dynamic fill /////////////////////////////////////////////
    this.volumeFill = this.add
      .rectangle()
      .setOrigin(0, 0)
      .setX(this.bar.x - this.bar.width / 2 + 15)
      .setY(this.bar.y - 3)
      .setFillStyle(0x916857)
    this.volumeFill.width = this.nob.x - this.volumeFill.x
    this.volumeFill.height = this.bar.height - 4
  }

  initVolumeSlider() {
    /////// text label /////////////////////////////////////////////
    const label = this.add
      .text(200, 460, t("Volume"), {
        fontFamily: Fonts.manaspace,
      })
      .setOrigin(1, 0.5)
      .setInteractive()
      .on("pointerdown", () => {
        if (this.sound.volume > 0) {
          this.sound.volume = 0
        } else {
          this.sound.volume = 1
        }
        this.scene.stop().start()
      })

    /////// volume bar /////////////////////////////////////////////
    this.bar = this.add
      .sprite(label.x + 160, label.y, Sprites.volumeBar)
      .setInteractive()
      .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer.x < barEndX && pointer.x > barStartX) {
          this.nob.x = pointer.x
          const position =
            (this.nob.x - (this.bar.x - this.bar.width / 2)) / this.bar.width
          let volume = Math.round(position * 1000) / 1000
          if (position < 0.1) volume = 0
          if (position > 0.9) volume = 1
          this.sound.volume = volume
        }
      })
    const barStartX = this.bar.x - this.bar.width / 2 + 15
    const barEndX = this.bar.x + this.bar.width / 2 - 15

    /////// volume knob /////////////////////////////////////////////
    const nobX =
      this.bar.x - this.bar.width / 2 + this.sound.volume * this.bar.width >=
      barEndX
        ? barEndX
        : this.bar.x -
            this.bar.width / 2 +
            this.sound.volume * this.bar.width <=
          barStartX
        ? barStartX
        : this.bar.x - this.bar.width / 2 + this.sound.volume * this.bar.width

    this.nob = this.add
      .sprite(nobX, label.y, Sprites.volumeNob)
      .setInteractive({ cursor: Sprites.pointerCursor })
      .setDepth(2)

    /////// volume fill /////////////////////////////////////////////
    this.initVolumeFill()

    /////// knob listeners /////////////////////////////////////////////
    this.nob.on("pointerdown", () => {
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown && pointer.x < barEndX && pointer.x > barStartX) {
          this.nob.x = pointer.x
          const position =
            (this.nob.x - (this.bar.x - this.bar.width / 2)) / this.bar.width
          let volume = Math.round(position * 1000) / 1000
          if (position < 0.1) volume = 0
          if (position > 0.9) volume = 1
          this.sound.volume = volume
        }
      })
    })

    this.input.on("pointerup", () => {
      this.input.off("pointermove")
      // save volume to local storage
      storage.set(StorageKeys.volume, (Math.round(this.sound.volume * 1000) / 1000).toString())
      // this.volumeFill.width = this.nob.x - this.volumeFill.x
    })
  }
}
