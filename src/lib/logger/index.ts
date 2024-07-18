import chalk, { type ChalkInstance } from 'chalk';


enum logType {
    DEBUG = "DEB",
    INFO =  "INF",
    ERROR = "err",
    FATAL = "ERR"
}
const logLevel = [
    logType.INFO, logType.FATAL, logType.DEBUG, logType.ERROR
]

let logs = 1;

function logFormat(type: logType, message: string, origin:string = "", color: ChalkInstance = chalk.reset) {
    const now = new Date()

    const year = now.getUTCFullYear()
    const month = now.getUTCMonth().toString().padStart(2, "0")
    const day = now.getUTCDate().toString().padStart(2, "0")
    const hour = now.getUTCHours().toString().padStart(2, "0")
    const minute = now.getUTCMonth().toString().padStart(2, "0")
    const second = now.getUTCSeconds().toString().padStart(2, "0")
    const milliSeconds = now.getUTCMilliseconds().toString().padStart(4, "0")


    const date = `${day}/${month}/${year}`
    const time = `${hour}:${minute}:${second}'${milliSeconds}`
    const dateTime = {
        console: `[${chalk.green(date)} ${chalk.yellow(time)} ${chalk.gray("UTC+0")}]`,
        text: `[${date} ${time} UTC+0]`
    }

    const originStr = origin != "" ? { console: chalk.white(origin) + ":", text: origin + ":"} : { console: "", text: "" }

    const msg = {
        console: color(message),
        text: message
    }

    const typeStr = {
        console: "[" + (type == logType.DEBUG ? chalk.cyan : type == logType.INFO ? chalk.yellow : type == logType.FATAL ? chalk.bgRed.white : type == logType.ERROR ? chalk.red : (x) => x)(type) + "]",
        text: "[" + type + "]"
    }

    return {
        console: [logs.toString().padStart(6, " "), typeStr.console, dateTime.console, originStr.console, msg.console].join(" "),
        text: [logs.toString().padStart(6, " "), typeStr.text, dateTime.text, originStr.text, msg.text].join(" ")
    }
}

function log(value: {console: string, text: string}) {
    logs++;
    console.log(value.console)
}

export class Logger {
    name: string;

    constructor(name: string = "") {
        this.name = name
    }

    debug (...message: string[]) {
        const msg = message.join(" ")
        if (!logLevel.includes(logType.DEBUG)) return
        const formatted = logFormat(logType.DEBUG, msg, (this || {name: ""}).name, chalk.gray)
        log(formatted)
    }
    info (...message: string[]) {
        const msg = message.join(" ")
        if (!logLevel.includes(logType.INFO)) return
        const formatted = logFormat(logType.INFO, msg, (this || {name: ""}).name)
        log(formatted)
    }
    error (...message: string[]) {
        const msg = message.join(" ")
        if (!logLevel.includes(logType.ERROR)) return
        const formatted = logFormat(logType.ERROR, msg, (this || {name: ""}).name, chalk.red)
        log(formatted)
    }
    fatal(...message: string[]) {
        const msg = message.join(" ")
        if (!logLevel.includes(logType.FATAL)) return
        const formatted = logFormat(logType.FATAL, msg, (this || {name: ""}).name, chalk.red)
        log(formatted)
    }
    getLogger(name: string) {
        return new Logger(this.name + " " + name)
    }
}

export default new Logger()