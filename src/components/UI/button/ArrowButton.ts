import { Sprites } from "../../../constants"

export default class ArrowButton extends Phaser.GameObjects.Sprite {
    private disabled = false

    constructor(
        scene:Phaser.Scene,
        x:number,
        y:number,
        direction: "left" | "right",
        onClick:() => void
    ) {
        super(scene, x, y, Sprites.arrowButton, 1)
        this.setInteractive({ cursor: Sprites.pointerCursor })
        direction === "left" && this.setRotation(Phaser.Math.DegToRad(180))
        this.attachEvents(onClick)
    }
    
    public enable() {
        if (!this.disabled) return
        this.setFrame(1)
        this.disabled = false
    }

    public disable() {
        if (this.disabled) return
        this.setFrame(0)
        this.disabled = true
    }

    private scaleTo(scale:number, cb = () => {}) {
        if (this.disabled) return
        this.scene.tweens.add({
            targets: this,
            scale,
            duration: 40,
            complete: cb
        }).play()
    }

    private attachEvents(onClick:() => void) {
        this.on("pointerout", () => this.scaleTo(1))
        this.on("pointerup", () => this.scaleTo(1, onClick))
        this.on("pointerdown", () => this.scaleTo(1.08))
    }

}

export const createArrowButton = (
    x:number,
    y:number,
    direction: "left" | "right",
    onClick:() => void,
    scene:Phaser.Scene
) => {
    const arrowButton = new ArrowButton(scene, x, y, direction, onClick)
    scene.add.existing(arrowButton)
    return arrowButton
}