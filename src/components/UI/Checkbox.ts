import { Fonts, Sounds, Sprites } from "../../constants"

export default class Checkbox extends Phaser.GameObjects.Sprite {
    private checked = false
    private enabled = true
    private label: Phaser.GameObjects.Text
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
        defaultValue: boolean,
        callback: (checked:boolean) => void,
    ) {
        super(scene, x, y, Sprites.checkbox, 0)
        this.sounds = {
            check: this.scene.sound.add(Sounds.brickbreak, { volume: 0.2 })
        }
        defaultValue && this.check()
        this.label = this.createLabel(label)
        const items = [this, this.label]
        items.forEach(x => x.setInteractive({ cursor: Sprites.pointerCursor }))
        items.forEach(x => x.on('pointerdown', () => this.handleClick(callback)))
    }

    check() {
        this.setFrame(1)
        this.checked = true
    }

    uncheck() {
        this.setFrame(0)
        this.checked = false
    }

    isChecked() {
        return this.checked
    }

    disable() {
        this.setAlpha(.5)
        this.removeInteractive()
        this.label.setAlpha(.5)
        this.label.removeInteractive()
        this.enabled = false
    }

    enable() {
        this.setAlpha(1)
        this.setInteractive({ cursor: Sprites.pointerCursor })
        this.label.setAlpha(1)
        this.label.setInteractive({ cursor: Sprites.pointerCursor })
        this.enabled = true
    }

    private createLabel(text:string) {
        return this.scene.add.text(this.x + 40, this.y, text, {
            fontFamily: Fonts.manaspace,
        }).setOrigin(0, .5)
    }

    private handleClick(callback: (checked:boolean) => void) {
        this.sounds.check.play()
        const frame = +this.frame.name === 0 ? 1 : 0
        this.setFrame(frame)
        this.checked = !!frame
        callback(!!frame)
    }
}

export const createCheckbox = (
    x: number,
    y: number,
    label: string,
    callback: (checked:boolean) => void,
    defaultValue: boolean,
    scene: Phaser.Scene,
) => {
    const checkbox = new Checkbox(scene, x, y, label, defaultValue, callback)
    scene.add.existing(checkbox)
    return checkbox
}