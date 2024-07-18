
export function nfoTimeStampValidator(value: string) {
    // YYYY-MM-SS hh:mm:ss
    if (value.length != 19) return false

    const format = [
        "number",
        "number",
        "number",
        "number",
        "dash",
        "number",
        "number",
        "dash",
        "number",
        "number",
        "space",
        "number",
        "number",
        "colon",
        "number",
        "number",
        "colon",
        "number",
        "number"
    ]

    const actualFormat = value.split("").map((char) => {
        if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(char)) return "number"
        if ("-" == char) return "dash"
        if (" " == char) return "space"
        if (":" == char) return "colon"
        return "unknown"
    })

    for (let i = 0; i < format.length; i++) {
        const target = format[i]
        const actual = actualFormat[i]

        if (target != actual) return false
    }


    return new Date(value).toString() != "Invalid Date"

}