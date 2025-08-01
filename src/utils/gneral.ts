import { StorageKeys } from "../constants"

export const storage = {
    set(id: StorageKeys, item: any) {
        localStorage?.setItem(id, JSON.stringify(item))
    },
    get(id: StorageKeys): any {
        const item = localStorage?.getItem(id)
        return item ? JSON.parse(item) : null
    },
    remove(id: StorageKeys) {
        localStorage?.removeItem(id)
    }
}

export const sleep = async (ms: number) => await new Promise((x) => setTimeout(x, ms))