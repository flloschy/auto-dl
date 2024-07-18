/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from "$lib/logger"
import type { autoCompleteFunction, commandValueObject, frontEndReadyArguments, frontEndReadyOption, validatorFunction, valueParserFunction } from "./UtilityTypes"

export class InternalArgument {
    name = ""
    description = ""
    typeString = ""
    validator: ((value: any, values: commandValueObject) => boolean) = () => true
    autoCompleter: ((value: any, values: commandValueObject) => string[]) = () => []
    parser: ((value: string, values: commandValueObject) => any) = (v) => v

    frontEndReadyObject():frontEndReadyArguments {
        return {
            name: this.name,
            description: this.description,
            typeString: this.typeString
        }
    }
}

export class ArgumentBuilder<T> {
    private internal = new InternalArgument()
    private logger = Logger.getLogger("Argument Builder")

    toOptional(): OptionBuilder<T> {
        return new OptionBuilder<T>()
            .setName(this.internal.name)
            .setDescription(this.internal.description)
            .setDisplayedType(this.internal.typeString)
            .setAutoComplete(this.internal.autoCompleter)
            .setValidator(this.internal.validator)
            .setParser(this.internal.parser)
    }

    setName(name: string) {
        this.logger.debug("changing name -> " + name)
        this.logger = Logger.getLogger("Argument Builder " + name)
        this.internal.name = name
        return this
    }
    setDescription(description: string) {
        this.logger.debug("description: " + description)
        this.internal.description = description
        return this
    }
    setParser(parser: valueParserFunction<T>) {
        this.logger.debug("parser set: " + parser.name)
        this.internal.parser = parser
        return this
    }
    setAutoComplete(completer: autoCompleteFunction<T>) {
        this.logger.debug("autoCompleter set: " + completer.name)
        this.internal.autoCompleter = completer
        return this
    }
    setValidator(validator: validatorFunction<T>) {
        this.logger.debug("validator set: " + validator.name)
        this.internal.validator = validator
        return this
    }
    setDisplayedType(str: string) {
        this.logger.debug("setDisplayedType set: " + str)
        this.internal.typeString = str;
        return this
    }
}

export class InternalOption {
    name = ""
    description = ""
    typeString = ""
    validator: ((value: any, values: commandValueObject) => boolean) = () => true
    autoCompleter: ((value: any, values: commandValueObject) => string[]) = () => []
    parser: ((value: string, values: commandValueObject) => any) = (v) => v

    frontEndReadyObject():frontEndReadyOption {
        return {
            name: this.name,
            description: this.description,
            typeString: this.typeString
        }
    }
}

export class OptionBuilder<T> {
    private internal = new InternalOption()
    private logger = Logger.getLogger("Option Builder")

    toArgument(): ArgumentBuilder<T> {
        return new ArgumentBuilder<T>()
            .setName(this.internal.name)
            .setDescription(this.internal.description)
            .setDisplayedType(this.internal.typeString)
            .setAutoComplete(this.internal.autoCompleter)
            .setValidator(this.internal.validator)
            .setParser(this.internal.parser)

    }

    setName(name: string) {
        this.logger.debug("changing name -> " + name)
        this.logger = Logger.getLogger("Option Builder " + name)
        this.internal.name = name
        return this
    }
    setDescription(description: string) {
        this.logger.debug("description: " + description)
        this.internal.description = description
        return this
    }
    setParser(parser: valueParserFunction<T>) {
        this.logger.debug("parser set: " + parser.name)
        this.internal.parser = parser
        return this
    }
    setAutoComplete(completer: autoCompleteFunction<T>) {
        this.logger.debug("autoCompleter set: " + completer.name)
        this.internal.autoCompleter = completer
        return this
    }
    setValidator(validator: validatorFunction<T>) {
        this.logger.debug("validator set: " + validator.name)
        this.internal.validator = validator
        return this
    }
    setDisplayedType(str: string) {
        this.logger.debug("setDisplayedType set: " + str)
        this.internal.typeString = str;
        return this
    }
}