import type { SeasonNFO } from "$lib/commandManager/commandUtility/metadata/types";
import { cleanFlatObject, cleanName, getPlaylistIdFromYoutubeUrl, getVideoIdFromYoutubeUrl, inRange, levenshtein, NFODateFormatter, pathAge } from "$lib/utility";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "fs";
import { showSelectArgumentExists, type Show } from "./Show";
import { SubCommandBuilder } from "$lib/commandManager/commandLib/Command";
import { ArgumentBuilder, OptionBuilder } from "$lib/commandManager/commandLib/Argument";
import { Episode } from "./Episode";
import { downloadYoutubeVideo, getYoutubePlaylistIds } from "$lib";
import type { ExecutionHandler } from "$lib/commandManager/commandLib/Execution";

export class Season {
    name: string;
    show: Show;
    metadata: SeasonNFO;
    exists: boolean;
    private episodes_: Episode[] = [];
    constructor (show: Show, loadOption: {name: string, folder?: undefined} | {folder: string, name?: undefined}) {
        this.show = show;

        const name = loadOption.name ? cleanName(loadOption.name) : loadOption.folder as string

        this.name = name
        this.exists = existsSync(`./downloads/video/${this.show.name}/${this.name}`)

        this.metadata = {
            dateadded: NFODateFormatter(this.exists ? pathAge(`./downloads/video/${this.show.name}/${this.name}`) : 0),
            originaltitle: this.name,
            title: this.name,
            plot: "",
            trailer: "",
            seasonnumber: ""
        }
        this.load()
    }

    private load() {
        if (existsSync(`./downloads/video/${this.show.name}/${this.name}/season.nfo`)) {
            const fileData = readFileSync(`./downloads/video/${this.show.name}/${this.name}/season.nfo`)
            const xml = new XMLParser().parse(fileData)
            const nfo = xml.season as SeasonNFO
            if (nfo) {
                nfo.trailer = nfo.trailer.replace("plugin://plugin.video.youtube/?action=play_video&videoid=", "")
                this.metadata = nfo
            }
        }
    }

    create() {
        const seasons = readdirSync(`./downloads/video/${this.show.name}`)
        if (seasons.includes(this.name)) return {
            success: false,
            lines: [["show already exists"]]
        }

        mkdirSync(`./downloads/video/${this.show.name}/${this.name}`)
        this.exists = true
        this.metadata.dateadded = NFODateFormatter(Date.now())

        if (this.metadata.seasonnumber == "") {
            this.metadata.seasonnumber = (this.show.seasons().length+1).toString()
        }

        this.writeNfo()
        return {
            success: true,
            lines: [["podcast created"]]
        }
    }

    private writeNfo() {
        if (!this.exists) return this.create()
        const data = new XMLBuilder({
            indentBy: "\t",
            format: true
        }).build({season: this.metadata})

        writeFileSync(`./downloads/video/${this.show.name}/${this.name}/season.nfo`, data)

        return {
            success: true,
            lines: [["updated!"]]
        }
    }

    edit(overwrite: Partial<SeasonNFO>) {
        overwrite = cleanFlatObject(overwrite)
        if (overwrite.trailer) {
            const id = getVideoIdFromYoutubeUrl(overwrite.trailer)
            if (id) {
                overwrite.trailer = `plugin://plugin.video.youtube/?action=play_video&videoid=${id}`
            } else {
                overwrite.trailer = ""
            }
        }

        const newTitle = this.metadata.title != overwrite.title

        if (overwrite.title && newTitle) {
            const title = cleanName(overwrite.title)
            renameSync(`./downloads/video/${this.show.name}/${this.name}`, `./downloads/video/${this.show.name}/${title}`)
            this.name = title
        }



        this.metadata = {...this.metadata, ...overwrite}
        return this.writeNfo()

    }

    delete() {
        if (!this.exists) return {
            success: false,
            lines: [["podcast doesn't exist"]]
        }


        const seasons = this.show.seasons().filter(e => parseInt(e.metadata.seasonnumber) > parseInt(this.metadata.seasonnumber))

        for (let index = 0; index < seasons.length; index++) {
            const ep = seasons[index];
            ep.edit({
                seasonnumber: (parseInt(ep.metadata.seasonnumber) - 1).toString()
            })
        }

        rmSync(`./downloads/video/${this.show.name}/${this.name}`, {
            force: true,
            recursive: true
        })
        return {
            success: true,
            lines: [["podcast deleted"]]
        }
    }

    episodes() {
        if (this.episodes_.length != 0) return this.episodes_
        const files = readdirSync(`./downloads/video/${this.show.name}/${this.name}`, {withFileTypes:true})
        const videos = files.filter(v => v.isFile() && v.name.endsWith(".webm"))
        this.episodes_ = videos.map(v => new Episode(this.show, this, v.name))
        return this.episodes_
    }

    async download(handler: ExecutionHandler ,link:string) {
        if (link.includes("playlist")) {
            const playlistId = getPlaylistIdFromYoutubeUrl(link)
            if (!playlistId) return
            const ids = await getYoutubePlaylistIds(playlistId)
            if (!ids) return
            for (let index = 0; index < ids.length; index++) {
                const id = ids[index];
                await this.download(handler, `https://youtu.be/${id}`)
            }
            return
        }
        const id = getVideoIdFromYoutubeUrl(link)
        if (!id) return
        const result = await downloadYoutubeVideo(handler, this.show.name, this.name, link)
        if (!result) return
        const episode = new Episode(this.show, this, result.filename)
        await episode.edit({title: result.videoTitle, youtubemetadataid: id})
    }

}



export const seasonExistsArgument = new ArgumentBuilder<Season>()
    .setName("season")
    .setDescription("select a season")
    .setDisplayedType("string")
    .setParser((v, values) => {
        const show = values.arguments[0] as Show
        const season = new Season(show, {name: v})
        if (season.exists) {
            return season
        }
        return new Season(show, {folder: v})})
    .setValidator(v => v.exists)
    .setAutoComplete((v, values) => {
        const show = values.arguments[0] as Show
        return show
            .seasons()
            .filter(s => s.name != v.name && s.metadata.title != v.metadata.title)
            .sort((a, b) => {
                const aScore = Math.max(levenshtein(a.name, v.name) + levenshtein(a.metadata.title, v.metadata.title))
                const bScore = Math.max(levenshtein(b.name, v.name) + levenshtein(b.metadata.title, v.metadata.title))
                return aScore - bScore
            })
            .slice(0, 10)
            .map(v => v.name)})

const plotOption = new OptionBuilder<string>()
    .setName("plot")
    .setDescription("Description of the show")
    .setDisplayedType("string")
    .setAutoComplete(v => [v])
    .setParser(v => v.trim())
    .setValidator(() => true)
const trailerOption  = new OptionBuilder<string>()
    .setName("trailer")
    .setDescription("The youtube viedo id of the trailner")
    .setDisplayedType("string")
    .setAutoComplete(v => [v])
    .setParser(v => v.trim())
    .setValidator(() => true)


export const seasonCreate = new SubCommandBuilder()
    .setName("season")
    .setDescription("create a season")
    .addArgument(showSelectArgumentExists)
    .addArgument(new ArgumentBuilder<string>()
        .setName("season")
        .setDescription("the name of the new season")
        .setDisplayedType("string")
        .setParser(v => v.trim())
        .setValidator((v, values) => {
            const show = values.arguments[0] as Show
            return !(new Season(show, {name: v}).exists)})
        .setAutoComplete((v) => {
            return [
                v
            ]}))
    .addOption(trailerOption)
    .addOption(plotOption)
    .setExecutionFunction((values) => {
        const show = values.arguments[0] as Show
        const season = new Season(show, {name: values.arguments[1]})

        return season.edit({
            trailer: values.options["trailer"],
            plot: values.options["plot"],
        })})

export const seasonEdit = new SubCommandBuilder()
    .setName("season")
    .setDescription("edit a season")
    .addArgument(showSelectArgumentExists)
    .addArgument(seasonExistsArgument)
    .addOption(new OptionBuilder<string>()
        .setName("title")
        .setDescription("the new title")
        .setDisplayedType("string")
        .setParser(v => v.trim())
        .setValidator(() => true)
        .setAutoComplete(v => [v]))
    .addOption(new OptionBuilder<number>()
        .setName("seasonnumber")
        .setDescription("the new season number")
        .setDisplayedType("number")
        .setParser(v => parseInt(v))
        .setValidator((v, values) => {
            const show = values.arguments[0] as Show
            const seasons = show.seasons().length
            return v > 0 && v <= seasons
        })
        .setAutoComplete((v, values) => {
            const show = values.arguments[0] as Show
            const seasons = show.seasons().length
            return [
                1,
                v-1,
                v,
                v+1,
                seasons
            ]
            .filter(v => v > 0 && v < seasons)
            .filter((v, i, a) => a.indexOf(v) == i)
            .map(x => x.toString())
        }))
    .addOption(trailerOption)
    .addOption(plotOption)
    .setExecutionFunction((values) => {
        const show = values.arguments[0] as Show
        const season = values.arguments[1] as Season

        const title = values.options["title"]
        const plot = values.options["plot"]
        const trailer = values.options["trailer"]
        const seasonnumberNew = values.options["seasonnumber"]
        const seasonnumberOld = parseInt(season.metadata.seasonnumber)

        if (seasonnumberNew != undefined) {
            /*
                +- Backwards ----------------------------------+
                |  From 9 to 5                                 |
                |                               /<<<<<<<<<<<\  |
                |                               |           ^  |
                |  Original Order:  1  2  3  4  5  6  7  8  9  |
                |                               \>>^>>^>>^>>/  |
                |                                              |
                |  Action:          0  0  0  0 +4 -1 -1 -1 -1  |
                |  Updated Order:   1  2  3  4  9  5  6  7  8  |
                +----------------------------------------------+

                +- Forwards -----------------------------------+
                |  From 3 to 8                                 |
                |                         />>>>>>>>>>>>>>\     |
                |                         ^              |     |
                |  Original Order:  1  2  3  4  5  6  7  8  9  |
                |                         \<<^<<^<<^<<^<</     |
                |                                              |
                |  Action:          0  0 +1 +1 +1 +1 +1 -5  0  |
                |  Updated Order:   1  2  4  5  6  7  8  3  9  |
                +----------------------------------------------+
            */


            season.edit({seasonnumber: "-1"})

            const forwards = seasonnumberNew < seasonnumberOld

            const seasons = show.seasons()

            const min = Math.min(seasonnumberNew, seasonnumberOld)
            const max = Math.max(seasonnumberNew, seasonnumberOld)
            const diff = max - min

            if (diff == 0) { /* empty */ }
            else if (diff == 1) {
                (seasons.find(x => parseInt(x.metadata.seasonnumber) == seasonnumberNew))?.edit({seasonnumber: seasonnumberOld.toString()})
            } else {
                for (let index = 0; index < seasons.length; index++) {
                    const current = parseInt(seasons[index].metadata.seasonnumber);
                    console.log({index, current, updated:  (current + (forwards ? -1 : +1))})
                    if (inRange(current, min, max)) {
                        seasons[index].edit({
                            seasonnumber: (current + (forwards ? +1 : -1)).toString()
                        })
                    }
                }
            }
        }

        return season.edit({
            title, plot, trailer, seasonnumber: seasonnumberNew
        })
    })

export const seasonDownload = new SubCommandBuilder()
    .setName("episode")
    .setDescription("download")
    .addArgument(showSelectArgumentExists)
    .addArgument(seasonExistsArgument)
    .addArgument(new ArgumentBuilder<string>()
        .setName("link")
        .setDescription("the link")
        .setDisplayedType("string")
        .setParser(v => v.trim())
        .setValidator(v => {
            try {
                new URL(v)
                return true
            } catch {
                return false
            }
        })
        .setAutoComplete(v => [v]))
    .setExecutionFunction<"async">(() => {
        return (handler, values) => {
            const season = values.arguments[1] as Season
            return season.download(handler, values.arguments[2] as string)
        }})