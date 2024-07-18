import Logger from "$lib/logger"
import commands from "../commandLoader/activeCommands"
import { InternalCommand } from "./Command"

const logIt = Logger.getLogger("loading commands")
export const internalCommands = commands.map((command) => {
    // @ts-expect-error internal is private but still can be accessed after compiling
    const internalCommand: InternalCommand = command.internal
    logIt.info(`loading ${internalCommand.name}`)
    return internalCommand
})

export const frontEndReadyCommands = internalCommands.map(command => command.frontEndReadyObject())