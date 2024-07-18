export function parseNumber(value: string) {
    try {
        return parseInt(value)
    } catch {
        return Infinity
    }
}
