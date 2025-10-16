import { t } from "i18next";
import { Anims, Fonts, Sounds, Sprites } from "../../constants";

export type KeyInfo = { code:string, keyCode:number }

export default class KeySelector extends Phaser.GameObjects.Sprite {
    private enabled = true
    private value: KeyInfo
    private label: Phaser.GameObjects.Text
    private text: Phaser.GameObjects.Text
    private callback: (obj:KeyInfo) => boolean
    private sounds: {
        [key: string]:
        | Phaser.Sound.NoAudioSound
        | Phaser.Sound.HTML5AudioSound
        | Phaser.Sound.WebAudioSound
    }

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        label: string,
        callback: (obj:KeyInfo) => boolean, // if key was ok, return true, else return false
        defaultValue: KeyInfo,
    ) {
        super(scene, x, y, Sprites.backButton, 0)
        this.callback = callback
        this.value = defaultValue
        this.setOrigin(0.5, 0.5).setInteractive({ cursor: Sprites.pointerCursor })
        this.sounds = {
            press: this.scene.sound.add(Sounds.buttonPress, { volume: .2 })
        }
        this.label = this.createLabel(label)
        this.text = this.createText(defaultValue.code)
        this.addMouseEvents()
    }

    disable() {
        this.setAlpha(.5)
        this.label.setAlpha(.5)
        this.text.setAlpha(.5)
        this.removeInteractive()
        this.enabled = false
    }

    enable() {
        this.setAlpha(1)
        this.label.setAlpha(1)
        this.text.setAlpha(1)
        this.setInteractive({ cursor: Sprites.pointerCursor })
        this.enabled = false
    }

    private createLabel(label:string) {
        const labelElement =  this.scene.add.text(this.x, this.y, label, { fontFamily: Fonts.manaspace })
            .setShadow(5, 3, "black", 2)
            .setOrigin(.5, .5)
            .setDepth(1)
        return labelElement
    }

    private createText(defaultText:string) {
        return this.scene.add.text(this.x + 60, this.y, defaultText, {
            fontFamily: Fonts.manaspace
        }).setOrigin(0, .5)
    }

    private startKeyInput() {
        this.text.setText(t("Press a key"))
        this.scene.input.once("pointerdown", this.cancelKeyInput, this) // like onBlur
        this.scene.input.keyboard?.once('keydown', this.handleChooseKey, this)
    }

    private cancelKeyInput() {
        this.text.setText(this.value.code)
        this.scene.input.keyboard?.off("keydown", this.handleChooseKey)
    }

    private handleChooseKey(e:KeyboardEvent) {
        const code = (e.key.trim() || e.code).toUpperCase()
        const keyCode = e.keyCode
        const isValidKey = Object.values(Phaser.Input.Keyboard.KeyCodes).find(key => key === keyCode)
        const wasSaved = isValidKey && this.callback({ code, keyCode })
        if (!wasSaved) return this.cancelKeyInput()
        this.text.setText(code)
        this.value = { code, keyCode }
        this.scene.input.off("pointerdown", this.cancelKeyInput, this)
    }

    private addMouseEvents() {
        const labelLift = 1
        const defaultLabelY = this.label.y
        this.on("pointerdown", () => {
            this.play(Anims.backButtonPressed)
            this.label.setY(defaultLabelY + labelLift)
            this.sounds.press.play()
        })
        this.on("pointerup", () => {
            this.play(Anims.backButtonIdle)
            this.startKeyInput()
        })
        this.on("pointerover", (pointer: Phaser.Input.Pointer) => {
            this.label.setY(defaultLabelY - labelLift).setShadowOffset(5, 3 + labelLift)
            if (!pointer.isDown) return
            this.play(Anims.backButtonPressed)
            this.label.setY(defaultLabelY + labelLift)
        })
        this.on("pointerout", () => {
            this.play(Anims.backButtonIdle)
            this.label.setY(defaultLabelY).setShadowOffset(5, 3 - labelLift)
        })
    }
}

export const createKeySelector = (
    x: number,
    y: number,
    label: string,
    callback: (obj:KeyInfo) => boolean,
    defaultValue: KeyInfo,
    scene: Phaser.Scene
) => {
    const keySelector = new KeySelector(scene, x, y, label, callback, defaultValue)
    scene.add.existing(keySelector)
    return keySelector
}