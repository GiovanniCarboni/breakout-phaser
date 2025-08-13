import * as WebFontLoader from "../scripts/webfontloader"

export default window.WebFont

export class WebFontFileLoader extends Phaser.Loader.File {
  private fontNames: string[]

  constructor(loader: Phaser.Loader.LoaderPlugin, fontNames: string[]) {
    super(loader, { type: "webfont", key: fontNames.toString() })
    this.fontNames = fontNames
  }

  load() {
    WebFontLoader.default.load({
      custom: {
        families: this.fontNames,
      },
      active: () => {
        // files loaded
        this.loader.nextFile(this, true)
      },
      inactive: () => {
        // font load failed
        // for example browser does not support
        console.warn("Failed to load fonts")
        this.loader.nextFile(this, false)
      },
    })
  }
}
