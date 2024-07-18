/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ExecutionHandler } from "./Execution";

export type valueParserFunction<T> = ((value: string, values: commandValueObject) => T)
export type autoCompleteFunction<T> = ((value: T, values: commandValueObject) => string[])
export type validatorFunction<T> = ((value: T, values: commandValueObject) => boolean)
export type internalAsyncExecutionFunction = (handler: ExecutionHandler, values: commandValueObject) => void
export type internalInstantExecutionFunction = (values: commandValueObject) => Promise<({
    success: true
    lines: logMessage[]
} | {
    success: false,
    lines: false | logMessage[];
})> | ({
    success: true
    lines: logMessage[]
} | {
    success: false,
    lines: false | logMessage[];
})
export type executionFunction<T extends "async" | "instant"> = T extends "async" ?  (values: commandValueObject) => internalAsyncExecutionFunction : internalInstantExecutionFunction

export type commandValueObject = {
    arguments: any[]
    options: {[key: string]: any}
};
export type frontEndReadyArguments = {
    name: string,
    description: string,
    typeString: string
}
export type frontEndReadyOption = frontEndReadyArguments

export type frontEndReadySubCommand = {
    name: string,
    description: string,
    arguments: frontEndReadyArguments[],
    options: {[key: string]: frontEndReadyOption}
}
export type frontEndReadyCommand = {
    name: string,
    description: string,
    arguments: frontEndReadyArguments[],
    options: {[key: string]: frontEndReadyOption}
    subCommands: {[key: string]: frontEndReadySubCommand}
}
export type apiTypingReturn = {
    options: string[]
    invalid: boolean
}
export type executionReturn = {
    redirect: string
    result: false
} | {
    redirect: false
    result: {
        success: false
        output: string
    } | {
        success: true,
        output: logMessage[]
    }
}

export enum messageColors {
    red = "#E05957",
    cyan = "#32978E",
    blue = "#2FA4D9",
    green = "#5CA25F",
    white = "#DCDCDC",
    yellow = "#F5E453"
}

export type logMessage = ({
    message: string,
    color: messageColors,
} | string)[]