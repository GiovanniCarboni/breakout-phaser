type DebugKeys = keyof typeof debug
const debug = {
    physics: false,
    level: false, // false, 2, 3, 4 ...
    fireBall: false,
    cannons: false,
    holdBall: false,
    shortPaddle: false, // either short or long, cant be both
    longPaddle: false,
}

const displayDebugging = () => {
    if (!Object.values(debug).filter(x => !!x).length) return
    const debugTableData = Object.keys(debug).map((behavior: string) => ({
        behavior: behavior,
        debugging: debug[behavior as DebugKeys]
    }))
    const style = `
        color: orangered;
        font-size: .9rem;
        padding: .2rem .8rem;
        font-weight: bold;
        border-radius: 5px;
        background-color: yellow;
        margin: .4rem;
    `
    console.group("%c Debug Settings", style)
    console.table(debugTableData)
    console.groupEnd()
}
displayDebugging()


export { debug }