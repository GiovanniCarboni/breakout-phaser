import { t } from "i18next"
import { transition } from "../anims/SceneTransitions"
import Brick from "../components/Brick/Brick"
import Bricks, { createBricks } from "../components/Brick/Bricks"
import { createSmallButton } from "../components/UI/button/SmallButton"
import { createButton } from "../components/UI/button/Button"
import { Scenes, Sprites, StorageKeys } from "../constants"
import { storage } from "../utils/gneral"
import ArrowButton, { createArrowButton } from "../components/UI/button/ArrowButton"

export class CreatedLevels extends Phaser.Scene {
  private levels: {
    representation: Bricks,
    model: { id: number, template: number[][] }
  }[] = []
  private currentlyDisplayed = 0
  private dots!: Phaser.GameObjects.Group
  private dotHighlight!: Phaser.GameObjects.Image
  private leftBtn!: ArrowButton
  private rightBtn!: ArrowButton

  constructor() {
    super({ key: Scenes.createdLevels })
  }

  create() {
    this.cameras.main.setBackgroundColor("#110702")
    this.addArrowButtons()
    this.addFrame()
    this.addButtons()
    this.reset()
  }

  private goTo(scene:Scenes, opt?:any) {
    transition("fadeOut", this, () => this.scene.start(scene, opt).stop())
  }

  private getCurrentLevelModel() {
    return this.levels[this.currentlyDisplayed].model
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE CANVAS FRAME
  private addFrame() {
    this.add.image(0, 0, Sprites.sideBar).setOrigin(0, 0)
    this.add.image(this.scale.width, 0, Sprites.sideBar).setOrigin(1, 0)
    this.add.image(0, 0, Sprites.sideBar).setOrigin(1, 0).setRotation(Phaser.Math.DegToRad(-90))
    this.add.image(0, this.scale.height, Sprites.sideBar).setOrigin(0, 0).setRotation(Phaser.Math.DegToRad(-90))
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE BUTTONS
  private addButtons() {
    const { width: canvasW, height: canvasH } = this.scale
    createSmallButton(135, 50, t("Back"), () => this.scene.start(Scenes.start), this)
    createButton(canvasW-240, canvasH-80, t("Edit"), () => this.goTo(Scenes.LevelEditor, this.getCurrentLevelModel()), this)
    createButton(canvasW/2, canvasH-80, t("New"), this.handleNew, this)
    createButton(240, canvasH-80, t("Delete"), this.handleDelete, this)
    createButton(canvasW/2, canvasH-180, "Play", () => this.goTo(Scenes.game, { isCustom: true, template: this.getCurrentLevelModel().template }), this, true)
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE CREATE NEW LEVEL
  private handleNew() {
    if (this.levels.length >= 10) return this.cameras.main.shake(100, 0.005)
    this.goTo(Scenes.LevelEditor, { id: null, template: null })
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE DELETE LEVEL
  private handleDelete() {
    const savedLevels = storage.get(StorageKeys.createdLevels)
    if (!savedLevels) return 
    const newSavedLevels = savedLevels.filter((level: { id:number }) => level.id !== this.getCurrentLevelModel().id)
    if (newSavedLevels.length === 0) {
      storage.remove(StorageKeys.createdLevels)
      this.goTo(Scenes.start)
    } else {
      storage.set(StorageKeys.createdLevels, newSavedLevels)
      this.reset()
    }
  }

  //////////////////////////////////////////////////////////////
  ////// INITIALIZE SCENE
  private reset() {
    const models = storage.get(StorageKeys.createdLevels)
    if (!models) return this.scene.start(Scenes.LevelEditor, { template: null }).stop()
    this.setLevels(models)
    this.addDots()
    this.setArrowButtonsState()
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE LEVEL OBJECTS BASED ON TEMPLATES AND DISPLAY CURRENT LEVEL
  private setLevels(models:{ id: number; template: number[][] }[]) {
    this.levels.forEach(({ representation }) => representation?.clear(true, true)) // remove visible bricks from canvas before recreating them with new models
    this.levels = models.map((model, i) => {
      const bricks = createBricks(this, undefined, model.template, {
        width: 36,
        height: 14,
        offset: { top: 120, left: 210 },
        padding: 2.7,
      }).setVisible(false).revealInvisible()
      if (this.currentlyDisplayed > models.length-1) this.currentlyDisplayed = models.length-1
      if (i === this.currentlyDisplayed) bricks.setVisible(true)
      bricks.children.each(brick => ((brick as Brick).setScale(0.7), true))
      return { representation: bricks, model }
    })
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE NAVIGATION DOTS
  private addDots() {
    this.dotHighlight?.destroy(true)
    if (this.dots?.children) {
      this.dots.children.each(dot => (dot.off("pointerdown"), true))
      this.dots.clear(true, true)
    } else this.dots = this.add.group({ classType: Phaser.GameObjects.Image })
    for (let i = 0; i <= this.levels.length-1; i++) {
      const x = 250 + i * 40
      const y = 50
      const dot = this.dots.get(x, y, Sprites.dot)
      dot.setInteractive({ cursor: Sprites.pointerCursor })
      dot.on("pointerdown", () => this.setDisplayedLevel(i))
      if (i === this.currentlyDisplayed) this.dotHighlight = this.add.image(x, y, Sprites.dotHighlight).setDepth(1)
    }
  }

  //////////////////////////////////////////////////////////////
  ////// CHANGE DISPLAYED LEVEL
  private setDisplayedLevel(index:number) {
    if (index > this.levels.length - 1 || index < 0) return
    this.currentlyDisplayed = index
    this.levels.forEach(({ representation }, i) => representation.setVisible(i === this.currentlyDisplayed))
    const currentDot = this.dots.getChildren()[this.currentlyDisplayed] as Phaser.GameObjects.Image
    this.dotHighlight.setX(currentDot.x).setY(currentDot.y)
    this.setArrowButtonsState()
  }

  //////////////////////////////////////////////////////////////
  ////// ARROW BUTTONS
  private addArrowButtons() {
    const y = this.scale.height/2 - 60
    this.leftBtn = createArrowButton(100, y, "left", () => this.setDisplayedLevel(this.currentlyDisplayed-1), this)
    this.rightBtn = createArrowButton(this.scale.width-100, y, "right", () => this.setDisplayedLevel(this.currentlyDisplayed+1), this)
  }

  private setArrowButtonsState() {
    if (!this.currentlyDisplayed) this.leftBtn.disable()
    else this.leftBtn.enable()
    if (this.levels.length-1 === this.currentlyDisplayed) this.rightBtn.disable()
    else this.rightBtn.enable()
  }

}
