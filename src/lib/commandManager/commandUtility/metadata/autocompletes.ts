export function nfoTimeStampAutocomplete(value: string) {
    const format = `YYYY-MM-DD hh:mm:ss`
    const templateString = format.split("")


    let offset = 0
    let completed = false
    value.split("").forEach((char, i) => {
        if (i+offset == format.length-1) completed = true
        if ([4, 7, 10, 13, 16].includes(i+offset) && char != format[i + offset]) offset++

        templateString[i + offset] = char
    })

    const now = new Date()
    const year = now.getUTCFullYear()
    const month = now.getUTCMonth().toString().padStart(2, "0")
    const day = now.getUTCDate().toString().padStart(2, "0")
    const hour = now.getUTCHours().toString().padStart(2, "0")
    const minute = now.getUTCMinutes().toString().padStart(2, "0")
    const seconds = now.getUTCSeconds().toString().padStart(2, "0")

    const nowString = `${year}-${month}-${day} ${hour}:${minute}:${seconds}`

    let str = templateString.join("").slice(0, format.length)

    if (completed) {
        if (new Date(str).toString() == "Invalid Date")
            str += " (invalid)"
    }

    return [str, nowString]
}