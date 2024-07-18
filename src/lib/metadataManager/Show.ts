import { ArgumentBuilder, OptionBuilder } from "$lib/commandManager/commandLib/Argument";
import { SubCommandBuilder } from "$lib/commandManager/commandLib/Command";
import { folderListAutocomplete } from "$lib/commandManager/commandUtility/general/autocompletes";
import { nfoTimeStampAutocomplete } from "$lib/commandManager/commandUtility/metadata/autocompletes";
import type { ShowNFO } from "$lib/commandManager/commandUtility/metadata/types";
import { nfoTimeStampValidator } from "$lib/commandManager/commandUtility/metadata/validators";
import { NFODateFormatter, cleanFlatObject, cleanName, getVideoIdFromYoutubeUrl, isCleaned, pathAge } from "$lib/utility";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "fs";
import { Season } from "./Season";

export class Show {
    name: string;
    metadata: ShowNFO;
    exists: boolean;
    private seasons_: Season[] = [];
    constructor (show: string) {

        this.name = show
        this.exists = existsSync(`./downloads/video/${this.name}`)

        this.metadata = {
            dateadded: NFODateFormatter(this.exists ? pathAge(`./downloads/video/${this.name}`) : 0),
            originaltitle: this.name,
            title: this.name,
            plot: "",
            releasedate: NFODateFormatter(0),
            studio: "unknown",
            trailer: "",
            youtubemetadataid: ""
        }
        this.load()
    }

    private load() {
        if (existsSync(`./downloads/video/${this.name}/tvshow.nfo`)) {
            const fileData = readFileSync(`./downloads/video/${this.name}/tvshow.nfo`)
            const xml = new XMLParser().parse(fileData)
            const nfo = xml.tvshow as ShowNFO
            if (nfo) {
                nfo.trailer = nfo.trailer.replace("plugin://plugin.video.youtube/?action=play_video&videoid=", "")
                this.metadata = nfo
            }
        }
    }

    create() {
        const podcasts = readdirSync(`./downloads/video`)
        if (podcasts.includes(this.name)) return {
            success: false,
            lines: [["show already exists"]]
        }

        mkdirSync(`./downloads/video/${this.name}`)
        this.exists = true
        this.metadata.dateadded = NFODateFormatter(Date.now())
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
            format: true,
            processEntities: false

        }).build({tvshow: this.metadata})

        writeFileSync(`./downloads/video/${this.name}/tvshow.nfo`, data)

        return {
            success: true,
            lines: [["updated!"]]
        }
    }

    edit(overwrite: Partial<ShowNFO>) {
        overwrite = cleanFlatObject(overwrite)
        if (overwrite.trailer) {
            const id = getVideoIdFromYoutubeUrl(overwrite.trailer)
            if (id) {
                overwrite.trailer = `plugin://plugin.video.youtube/?action=play_video&videoid=${id}`
            } else {
                overwrite.trailer = ""
            }
        }
        const updatedName = this.metadata.title != overwrite.title
        this.metadata = {...this.metadata, ...overwrite}

        const result = this.writeNfo()

        if (updatedName && overwrite.title) {
            renameSync(`./downloads/video/${this.name}`, `./downloads/video/${cleanName(overwrite.title)}`)
            this.name = cleanName(overwrite.title)
        }


        return result

    }

    delete() {
        if (!this.exists) return {
            success: false,
            lines: [["podcast doesn't exist"]]
        }

        rmSync(`./downloads/video/${this.name}`, {
            force: true,
            recursive: true
        })
        return {
            success: true,
            lines: [["podcast deleted"]]
        }
    }

    seasons() {
        if (this.seasons_.length != 0) return this.seasons_
        const subDirs = readdirSync(`./downloads/video/${this.name}`, {withFileTypes:true})
        const folders = subDirs.filter(v => v.isDirectory()).map(v => v.name)
        this.seasons_ = folders.map(v => new Season(this, {folder: v}))
        return this.seasons_
    }
}

export const showSelectArgumentExists = new ArgumentBuilder<Show>()
    .setName("name")
    .setDescription("The name of the show")
    .setDisplayedType("string")
    .setParser(name => new Show(name))
    .setValidator(sho => sho.exists)
    .setAutoComplete(sho => folderListAutocomplete("video", sho.name))

const showSelectArgumentNew = new ArgumentBuilder<Show>()
    .setName("name")
    .setDescription("The name of the new show")
    .setDisplayedType("string")
    .setParser(name => new Show(name))
    .setValidator(sho => !sho.exists && isCleaned(sho.name))
    .setAutoComplete(sho => ([
        cleanName(sho.name)
    ]))

/*
dateadded: NFODateFormatter(this.exists ? pathAge(`./downloads/video/${this.name}`) : 0),
originaltitle: this.name,
title: this.name,
plot: "",
releasedate: NFODateFormatter(0),
studio: "unknown",
trailer: "",
youtubemetadataid: ""
*/


const plotOption = new OptionBuilder<string>()
    .setName("plot")
    .setDescription("Description of the show")
    .setDisplayedType("string")
    .setAutoComplete(v => [v])
    .setParser(v => v.trim())
    .setValidator(() => true)

const titleOption = new OptionBuilder<string>()
    .setName("title")
    .setDescription("the name of the show")
    .setDisplayedType("string")
    .setAutoComplete(v => [v])
    .setParser(v => v)
    .setValidator(v => !(new Show(cleanName(v)).exists))
const releaseOption = new OptionBuilder<string>()
    .setName("releasedate")
    .setDescription("when the show was first released")
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setValidator(nfoTimeStampValidator)
    .setAutoComplete(nfoTimeStampAutocomplete)
const studioOption = new OptionBuilder<string>()
    .setName("studio")
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
const youtubemetadataidOption  = new OptionBuilder<string>()
    .setName("youtubemetadataid")
    .setDescription("The youtube channel id of the channel")
    .setDisplayedType("string")
    .setAutoComplete(v => [v])
    .setParser(v => v.trim())
    .setValidator(() => true)

export const showCreate = new SubCommandBuilder()
    .setName("show")
    .setDescription("Create a new show")
    .addArgument(showSelectArgumentNew)
    .addOption([
        plotOption,
        releaseOption,
        studioOption,
        trailerOption,
        youtubemetadataidOption
    ])
    .setExecutionFunction<"instant">((values) => {
        const show = values.arguments[0] as Show
        show.create()
        return show.edit({
            title: values.options["title"],
            releasedate: values.options["releasedate"],
            plot: values.options["plot"],
            studio: values.options["studio"],
            trailer: values.options["trailer"],
            youtubemetadataid: values.options["youtubemetadataid"]
        })

    })

export const showRemove = new SubCommandBuilder()
    .setName("show")
    .setDescription("Delete a show and all of its episodes and seasons")
    .addArgument(showSelectArgumentExists)
    .setExecutionFunction<"instant">((values) => {
        const show = values.arguments[0] as Show
        return show.delete()
    })

export const showEdit = new SubCommandBuilder()
    .setName("show")
    .setDescription("Edit metadata from a show")
    .addArgument(showSelectArgumentExists)
    .addOption([
        titleOption,
        plotOption,
        releaseOption,
        studioOption,
        trailerOption,
        youtubemetadataidOption
    ])
    .setExecutionFunction<"instant">((values) => {
        const show = values.arguments[0] as Show
        return show.edit({
            title: values.options["title"],
            releasedate: values.options["releasedate"],
            plot: values.options["plot"],
            studio: values.options["studio"],
            trailer: values.options["trailer"],
            youtubemetadataid: values.options["youtubemetadataid"]
        })
    })