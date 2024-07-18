import { ArgumentBuilder } from "$lib/commandManager/commandLib/Argument";
import { rangeToArray } from "$lib/utility";
import { parseNumber } from "../general/parsers";
import { numberValidator } from "../general/validators";
import { nfoTimeStampAutocomplete } from "./autocompletes";
import { nfoTimeStampValidator } from "./validators";
import fs from "node:fs"

export const titleTemplate = (description: string) => new ArgumentBuilder<string>()
    .setName("title")
    .setDescription(description)
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setAutoComplete(v => ([v.slice(0, 30)]))
    .setValidator(v => v.length <= 30)
export const releaseDateTemplate = (description: string) => new ArgumentBuilder<string>()
    .setName("releasedate")
    .setDescription(description)
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setAutoComplete(nfoTimeStampAutocomplete)
    .setValidator(nfoTimeStampValidator)
export const youtubemetadataidTemplate = (description: string) => new ArgumentBuilder<string>()
    .setName("youtubemetadataid")
    .setDescription(description)
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setAutoComplete(v => ([v.slice(0, 30)]))
    .setValidator(v => v.length <= 30)
export const studioTemplate = (description: string) => new ArgumentBuilder<string>()
    .setName("studio")
    .setDescription(description)
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setAutoComplete(v => ([v.slice(0, 30)]))
    .setValidator(v => v.length <= 30)
export const plotTemplate = (description: string) => new ArgumentBuilder<string>()
    .setName("plot")
    .setDescription(description)
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setAutoComplete(v => ([v.trim()]))
    .setValidator(() => true)
export const trailerTemplate = (description: string) => new ArgumentBuilder<string>()
    .setName("trailer")
    .setDescription(description)
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setAutoComplete(v => ([v]))
    .setValidator(() => true)
export const seasonnumberTemplate = () => new ArgumentBuilder<number>()
    .setName("seasonnumber")
    .setDescription("The number of the season (if between: the affected seasons will change accordingly)")
    .setDisplayedType("number")
    .setParser(parseNumber)
    .setAutoComplete((value, values) => {
        const series = values.arguments[0]
        const seasons = fs.readdirSync(`./downloads/youtube/${series}`).length
        return rangeToArray(0, seasons).map(x => (x+1).toString())
    })
    .setValidator((value, values) => {
        const series = values.arguments[0]
        const seasons = fs.readdirSync(`./downloads/youtube/${series}`).length
        return numberValidator(value, 0, seasons+1)
    })
export const episodeNumberTemplate = () => new ArgumentBuilder<number>()
    .setName("episode")
    .setDescription("The number of the episode (if between: the affected episodes will change accordingly)")
    .setDisplayedType("number")
    .setParser(parseNumber)
    .setAutoComplete((value, values) => {
        const show = values.arguments[0]
        const season = values.arguments[1]
        const episodes = fs.readdirSync(`./downloads/youtube/${show}/${season}`).length
        return rangeToArray(0, episodes).map(toString)
    })
    .setValidator((value, values) => {
        const show = values.arguments[0]
        const season = values.arguments[1]
        const episodes = fs.readdirSync(`./downloads/youtube/${show}/${season}`).length
        return numberValidator(value, 0, episodes+1)
    })
export const podcastEpisodeNumberTemplate = () => new ArgumentBuilder<number>()
    .setName("episode")
    .setDescription("The number of the episode (if between: the affected episodes will change accordingly)")
    .setDisplayedType("number")
    .setParser(parseNumber)
    .setAutoComplete((value, values) => {
        const podcast = values.arguments[0]
        const episodes = fs.readdirSync(`./downloads/podcast/${podcast}`).length
        return rangeToArray(0, episodes).map(toString)
    })
    .setValidator((value, values) => {
        const podcast = values.arguments[0]
        const episodes = fs.readdirSync(`./downloads/podcast/${podcast}`).length
        return numberValidator(value, 0, episodes+1)
    })