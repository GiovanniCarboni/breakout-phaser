import { t } from "i18next"
import Brick from "../components/Brick/Brick"
import Bricks, { createBricks } from "../components/Brick/Bricks"
import { createSmallButton } from "../components/UI/button/SmallButton"
import ClearButton, { createClearButton } from "../components/UI/button/ClearButton"
import { Anims, Fonts, Scenes, Sounds, Sprites, StorageKeys } from "../constants"
import { transition } from "../anims/SceneTransitions"
import { storage } from "../utils/gneral"
import EraserButton, { createEraserButton } from "../components/UI/button/EraserButton"

export class LevelEditor extends Phaser.Scene {
  private levelId?: number
  private slots!: Bricks
  private clearButton!: ClearButton
  private playButton!: Phaser.GameObjects.Sprite
  private selectedBrick?: Phaser.GameObjects.Sprite
  private brickHighlight?: Phaser.GameObjects.Sprite
  private message?: Phaser.GameObjects.Text
  private messageTimeout?: Phaser.Time.TimerEvent
  private eraser!: EraserButton
  private sounds!: {
    [key: string]:
      | Phaser.Sound.NoAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.WebAudioSound
  }

  constructor() {
    super({ key: Scenes.LevelEditor })
  }

  //////////////////////////////////////////////////////////////
  ////// INIT
  init(data: { id: number; template: number[][] }) {   
    this.selectedBrick = undefined
    if (!data.template && !data.id) { // there no incoming template (blank page)
      this.slots = createBricks(this, 9)
      this.levelId = Date.now()
    } else { // there is an incoming template
      this.levelId = data.id
      this.slots = createBricks(this, undefined, data.template.map((row, i) => row.map((num, j) => {
        if (i === 0) return 0
        if (j === 0) return 0
        if (j === 18) return 0
        return num === 0 ? 9 : num
      }))).revealInvisible()
    }
  }

  //////////////////////////////////////////////////////////////
  ////// CREATE
  create() {
    transition("fadeIn", this)
    // set background color
    this.cameras.main.setBackgroundColor("#110702")

    // init elements
    this.initBrickSelector()
    this.initPlayButton()

    //////////////////////////////////////////////////////////
    ////// GAME FRAME
    this.add.image(0, 0, Sprites.sideBar).setOrigin(0, 0)
    this.add.image(this.scale.width, 0, Sprites.sideBar).setOrigin(1, 0)
    this.add.image(0, 0, Sprites.sideBar).setOrigin(1, 0).setRotation(Phaser.Math.DegToRad(-90))
    this.add.image(0, this.scale.height, Sprites.sideBar).setOrigin(0, 0).setRotation(Phaser.Math.DegToRad(-90))
    ///////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////
    ////// SOUND
    this.sounds = {
      shuffle: this.sound.add(Sounds.shuffle, {  volume: 0.2 }),
      btnPressed: this.sound.add(Sounds.buttonPress, { volume: 0.2 }),
      select: this.sound.add(Sounds.brickbreak, { volume: 0.2 }),
      erase: this.sound.add(Sounds.erase)
    }

    //////////////////////////////////////////////////////////////
    ////// BACK & SAVE BUTTONS
    createSmallButton(135, 50, t("Back"), this.handleBack, this)
    createSmallButton(this.scale.width - 135, 50, t("Save"), this.handleSave, this)

    //////////////////////////////////////////////////////////////
    ////// CLEAR BUTTON
    this.clearButton = createClearButton(
      this.scale.width - 241,
      50,
      this.handleClear,
      this
    ).setVisible(true)

    //////////////////////////////////////////////////////////////
    ////// SAVE BUTTON
    this.eraser = createEraserButton(
      this.scale.width - 200,
      50,
      this.unselectBrick,
      this,
    )

    //////////////////////////////////////////////////////////////
    ////// SELECT SLOT
    this.slots.children.each((slot) => {
      ["pointerover", "pointerdown"].forEach(ev => {
        slot.on(ev, (pointer:Phaser.Input.Pointer) => this.handleSelectSlot(pointer, slot), this)
      })
      return true
    })
  }

  //////////////////////////////////////////////////////////////
  ////// UPDATE
  update() {
    this.slots.children.each((slotObj) => {
      const slot = slotObj as Brick
      if (slot.texture.key !== Sprites.blankBrick) {
        this.clearButton.setVisible(true)
        return false
      }
      this.clearButton.setVisible(false)
      return true
    })
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE BACK
  handleBack() {
    this.eraser.deactivate()
    this.input.setDefaultCursor(Sprites.defaultCursor)
    const savedData = storage.get(StorageKeys.createdLevels)
    transition("fadeOut", this, () => {
      this.message = undefined
      if (savedData) {
        this.scene.start(Scenes.createdLevels)
        this.scene.stop()
      } else {
        this.scene.start(Scenes.start)
        this.scene.stop()
      }
    })
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE CLEAR
  handleClear() {
    this.sounds.erase.play()
    this.eraser.deactivate()
    this.unselectBrick()
    this.slots.children.each((slotObj) => {
      const slot = slotObj as Brick
      if (slot.anims.isPlaying) slot.anims.stop()
      if (slot.texture.key !== Sprites.blankBrick)
        slot.setTexture(Sprites.blankBrick)
      return true
    })
  }

  //////////////////////////////////////////////////////////////
  ////// HANDLE SAVE
  handleSave() {
    if (!this.canSave()) return
    this.saveToStorage()
    this.handleBack()
  }

  // ///////////////////////////////////////////////////////////
  ////// DISPLAY MESSAGE
  displayMessage(msg: string, shake = false) {
    shake && this.cameras.main.shake(100, 0.005)
    if (this.message && this.message.text === msg) return
    const removeMsg = () => {
      this.message?.destroy()
      this.message = undefined
      this.messageTimeout = undefined
    }
    if (this.message) {
      this.messageTimeout?.remove()
      removeMsg()
    }
    this.message = this.add
      .text(
        this.scale.width - 120,
        this.scale.height - 170,
        msg,
        { fontFamily: Fonts.manaspace }
      )
      .setOrigin(1, 0)
    this.messageTimeout = this.time.delayedCall(3000, removeMsg)
  }

  //////////////////////////////////////////////////////////////
  ////// MESSAGE IF CAN'T SAVE/PLAY
  canSave(): boolean {
    const template: number[][] = Bricks.getTemplateFromBricks(this.slots)
    if (!template.flat().some((brick) => ![0, 3, 7].includes(brick))) {
      this.displayMessage(t("Template must contain at least one breakable brick"), true)
      return false
    }
    return true
  }

  //////////////////////////////////////////////////////////////
  ////// SAVE TO LOCAL STORAGE
  saveToStorage() {
    const data = storage.get(StorageKeys.createdLevels)
    const template = Bricks.getTemplateFromBricks(this.slots)
    // if no levels in local storage
    if (!data) return storage.set(StorageKeys.createdLevels, [{ id: Date.now(), template }])
    // if there are levels in local storage
    const savedLevels = data as { id: number; template: number[][] }[]
    const existingLevelIndex = savedLevels.findIndex((level, i) => level.id === this.levelId)
    // level is new
    if (existingLevelIndex < 0) return storage.set(StorageKeys.createdLevels, [...savedLevels, {
      id: this.levelId,
      template
    }])
    // level exists
    savedLevels[existingLevelIndex!].template = template
    storage.set(StorageKeys.createdLevels, savedLevels)
  }

  //////////////////////////////////////////////////////////////
  ////// SELECT SLOT
  handleSelectSlot(pointer: Phaser.Input.Pointer, slot: Phaser.GameObjects.GameObject) {
    const selectedSlot = slot as Brick
    if (!this.eraser.isActive() && pointer.leftButtonDown()) this.insertBrick(selectedSlot)
    else if (this.eraser.isActive() && pointer.isDown) this.eraseBrick(selectedSlot)
  }

  insertBrick(selectedSlot: Brick) {
    if (!this.selectedBrick) return
    if (selectedSlot.anims?.isPlaying) selectedSlot.anims.stop()
    if (this.selectedBrick.anims?.isPlaying) {
      selectedSlot.play(this.selectedBrick.anims.currentAnim!)
    } else selectedSlot.setTexture(this.selectedBrick.texture.key)
    const frameToShow = this.selectedBrick.getData("frameToShow")
    if (frameToShow) selectedSlot.setFrame(frameToShow)
  }

  eraseBrick(selectedSlot: Brick) {
    if (selectedSlot.anims.isPlaying) selectedSlot.anims.stop()
    if (selectedSlot.texture.key === Sprites.blankBrick) return
    !this.sounds.erase.isPlaying && this.sounds.erase.play()
    selectedSlot.setTexture(Sprites.blankBrick)
  }

  //////////////////////////////////////////////////////////////
  ////// PLAY BUTTON
  initPlayButton() {
    this.playButton = this.add
      .sprite(this.scale.width - 162, this.scale.height - 89, Sprites.playButton)
      .setInteractive({ cursor: Sprites.pointerCursor })
      .on("pointerdown", () => this.playButton.setFrame(1)) // pressed
      .on("pointerup", () => this.startGame())
      .on("pointerout", () => this.playButton.setFrame(0)) // idle
      .on("pointerover", (pointer: Phaser.Input.Pointer) => {
        this.playButton.setFrame(2) // hover
        if (pointer.isDown) this.playButton.setFrame(1) // pressed
      })
  }

  //////////////////////////////////////////////////////////////
  ////// START GAME
  startGame() {
    if (!this.canSave()) return
    const template: number[][] = Bricks.getTemplateFromBricks(this.slots)
    this.saveToStorage()
    transition("fadeOut", this, () => {
      this.message = undefined
      this.eraser.deactivate()
      this.scene.start(Scenes.game, { isCustom: true, template })
      this.scene.stop()
    })
  }

  //////////////////////////////////////////////////////////////
  ////// BRICK SELECTOR
  initBrickSelector() {
    this.add
      .sprite(0, this.scale.height, Sprites.brickSelector)
      .setOrigin(0, 1)
      .setDepth(-1)

    const canvasH = this.scale.height
    const bestScore = storage.get(StorageKeys.bestScore)

    const bricks = [
      { x: 160, y: canvasH - 110, sprite: Sprites.commonBrick },
      { x: 160, y: canvasH - 70, sprite: Sprites.fireBrick, play: Anims.fireBrick },
      { x: 240, y: canvasH - 110, sprite: Sprites.metalBrick },
      { x: 240, y: canvasH - 70, sprite: Sprites.iceBrick },
      { x: 320, y: canvasH - 110, sprite: Sprites.rockBrick },
      { x: 320, y: canvasH - 70, sprite: Sprites.glassBrick, frame: 1 },
      { x: 400, y: canvasH - 110, sprite: Sprites.grassBrick },
    ].map((brick, i) => i > bestScore ? {
      ...brick,
      sprite: Sprites.lockedBrick,
      play: null,
    } : brick)

    // create selectable bricks
    bricks.forEach(brick => {
      const brickEl = this.add.sprite(
        brick.x,
        brick.y,
        brick.sprite
      )
      if (brick.play) {
        brickEl.setData("toPlay", brick.play)
        brickEl.play(brick.play)
      }
      if (brick.frame) {
        brickEl.setData("frameToShow", brick.frame)
        brickEl.setFrame(1)
      }
      brickEl.setInteractive({ cursor: Sprites.pointerCursor })
      brickEl.setOrigin(0.5, 0.5)
      brickEl.on("pointerdown", brick.sprite === Sprites.lockedBrick 
        ? () => this.displayMessage(t("You need to clear more stages to unlock this brick"))
        : () => this.handleSelectBrick(brickEl, brick.sprite)
      )
    })

    // UNSELECT BRICK
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) this.unselectBrick()
    })
  }

  private handleSelectBrick(brick: Phaser.GameObjects.Sprite, sprite: string) {
    if (this.eraser.isActive()) this.eraser.deactivate()
    this.unselectBrick()
    this.sounds.select.play()
    this.brickHighlight = Brick.createHighlight(brick.x, brick.y, this)
    this.selectedBrick = this.add.sprite(brick.x + 8, brick.y + 5, sprite)
    const frameToShow = brick.getData("frameToShow")
    if (frameToShow) {
      this.selectedBrick.setFrame(frameToShow)
      this.selectedBrick.setData("frameToShow", frameToShow)
    }
    const toPlayAnim = brick.getData("toPlay")
    if (toPlayAnim) this.selectedBrick.play(toPlayAnim)
    this.input.off("pointermove", this.handleMoveBrick, this)
    this.input.on("pointermove", this.handleMoveBrick, this)
  }

  private handleMoveBrick(pointer: Phaser.Input.Pointer) {
    this.selectedBrick?.setX(pointer.x)
    this.selectedBrick?.setY(pointer.y)
  }

  private unselectBrick() {
    if (!this.selectedBrick) return
    this.selectedBrick.destroy()
    this.brickHighlight?.destroy()
    this.selectedBrick = undefined
  }
}
