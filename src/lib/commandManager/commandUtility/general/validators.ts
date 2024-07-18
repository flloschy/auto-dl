import fs from "node:fs"

export function numberValidator(value: number, min?:number, max?:number) {
    if (!isFinite(value)) return false

    if (min && !max) {
        return value >= min
    }
    if (!min && max) {
        return value <= max
    }
    if (min && max) {
        return value >= min && value <= max
    }

    return true
}

export function validNewFileName(location: string, typed: string) {
    const playlists = fs.readdirSync(`./downloads/${location}`)
    const valid = !playlists.includes(typed) && typed.length < 25
    return valid
}

export function validExistingFileName(location: string, typed: string) {
    const playlists = fs.readdirSync(`./downloads/${location}`)
    const valid = playlists.includes(typed)
    return valid
}

export function validUrls(values: string) {
    return values.split(",").every(v => {try {new URL(v);return true} catch {return false}})
}