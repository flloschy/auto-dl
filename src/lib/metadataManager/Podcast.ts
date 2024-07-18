import { downloadYoutubeSong, getYoutubePlaylistIds } from "$lib";
import { ArgumentBuilder, OptionBuilder } from "$lib/commandManager/commandLib/Argument";
import { SubCommandBuilder } from "$lib/commandManager/commandLib/Command";
import type { ExecutionHandler } from "$lib/commandManager/commandLib/Execution";
import { folderListAutocomplete } from "$lib/commandManager/commandUtility/general/autocompletes";
import type { PodcastNFO } from "$lib/commandManager/commandUtility/metadata/types";
import { NFODateFormatter, cleanFlatObject, cleanName, getPlaylistIdFromYoutubeUrl, isCleaned, pathAge } from "$lib/utility";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, renameSync } from "fs";
import { PodcastEpisode } from "./PodcastEpisode";
import { validUrls } from "$lib/commandManager/commandUtility/general/validators";

export class Podcast {
    name: string;
    metadata: PodcastNFO;
    exists: boolean;
    constructor (podcast: string) {

        this.name = podcast
        this.exists = existsSync(`./downloads/podcast/${this.name}`)

        this.metadata = {
            dateadded: NFODateFormatter(this.exists ? pathAge(`./downloads/podcast/${this.name}`) : 0),
            originaltitle: this.name,
            title: this.name,
            plot: ""
        }
        this.load()
    }

    private load() {
        if (existsSync(`./downloads/podcast/${this.name}/album.nfo`)) {
            const fileData = readFileSync(`./downloads/podcast/${this.name}/album.nfo`)
            const xml = new XMLParser().parse(fileData)
            const nfo = xml.album
            if (nfo) {
                this.metadata = nfo
            }
        }
    }

    create() {
        const podcasts = readdirSync(`./downloads/podcast`)
        if (podcasts.includes(this.name)) return {
            success: false,
            lines: [["podcast already exists"]]
        }

        mkdirSync(`./downloads/podcast/${this.name}`)
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
            format: true
        }).build({album: this.metadata})

        writeFileSync(`./downloads/podcast/${this.name}/album.nfo`, data)

        return {
            success: true,
            lines: [["updated!"]]
        }
    }

    edit(overwrite: Partial<PodcastNFO>) {
        overwrite = cleanFlatObject(overwrite)
        if (overwrite.title) {
            if (this.metadata.title != overwrite.title) {
                renameSync(`./downloads/podcast/${this.name}`, `./downloads/podcast/${overwrite.title}`)
                this.name = overwrite.title
            }
        }

        this.metadata = {...this.metadata, ...overwrite}
        return this.writeNfo()
    }

    episodes() {
        return readdirSync(`./downloads/podcast/${this.name}`, {withFileTypes: true})
            .filter(d => d.isFile() && d.name.endsWith(".mp3"))
            .map(d => {
                return new PodcastEpisode(this, d.name)
            })
            .sort((a, b) => parseInt(a.metadata.episode) - parseInt(b.metadata.episode))
    }

    delete() {
        if (!this.exists) return {
            success: false,
            lines: [["podcast doesn't exist"]]
        }

        rmSync(`./downloads/podcast/${this.name}`, {
            force: true,
            recursive: true
        })
        return {
            success: true,
            lines: [["podcast deleted"]]
        }
    }

    async download(handler: ExecutionHandler, links: string[]) {
        for (let index = 0; index < links.length; index++) {
            const link = links[index];

            if (link.includes("playlist")) {
                const playlistId = getPlaylistIdFromYoutubeUrl(link) as string
                const ids = await getYoutubePlaylistIds(playlistId)

                for (let index2 = 0; index2 < ids.length; index2++) {
                    const id = ids[index2];
                    const out = await downloadYoutubeSong(handler, this.name, `https://youtu.be/${id}`, "podcast")
                    if (typeof out == "object") {
                        const episode = new PodcastEpisode(this, out.filename)
                        episode.edit({title: out.videoTitle})
                        episode.writeNfo()
                    }
                }
            } else {
                const out = await downloadYoutubeSong(handler, this.name, link, "podcast")
                if (typeof out == "object") {
                    const episode = new PodcastEpisode(this, out.filename)
                    episode.edit({title: out.videoTitle})
                    episode.writeNfo()
                }
            }
        }

    }
}

const podcastSelectArgumentExists = new ArgumentBuilder<Podcast>()
    .setName("name")
    .setDescription("The name of the new Podcast")
    .setDisplayedType("string")
    .setParser(name => new Podcast(name))
    .setValidator(pod => pod.exists)
    .setAutoComplete(pod => folderListAutocomplete("podcast", pod.name))

const podcastSelectArgumentNew = new ArgumentBuilder<Podcast>()
    .setName("name")
    .setDescription("The name of the new Podcast")
    .setDisplayedType("string")
    .setParser(name => new Podcast(name))
    .setValidator(pod => !pod.exists && isCleaned(pod.name))
    .setAutoComplete(pod => ([
        cleanName(pod.name)
    ]))

const plotOption = new OptionBuilder<string>()
    .setName("plot")
    .setDescription("A little description about what the podcast is about")
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setValidator(() => true)
    .setAutoComplete(v => ([v]))

export const podcastCreate = new SubCommandBuilder()
    .setName("podcast")
    .setDescription("Create a new Podcast")
    .addArgument(podcastSelectArgumentNew)
    .addOption(plotOption)
    .setExecutionFunction<"instant">((values) => {
        const podcast = values.arguments[0] as Podcast
        const plot = values.options["plot"] as string
        if (plot) {
            podcast.metadata.plot = plot
        }
        return podcast.create()
    })

export const podcastRemove = new SubCommandBuilder()
    .setName("podcast")
    .setDescription("Delete a podcast and all of its episodes")
    .addArgument(podcastSelectArgumentExists)
    .setExecutionFunction<"instant">((values) => {
        const podcast = values.arguments[0] as Podcast
        return podcast.delete()
    })

export const podcastEdit = new SubCommandBuilder()
    .setName("podcast")
    .setDescription("Edit metadata from a podcast")
    .addArgument(podcastSelectArgumentExists)
    .addOption(plotOption)
    .addOption(podcastSelectArgumentNew.toOptional())
    .setExecutionFunction<"instant">((values) => {
        const podcast = values.arguments[0] as Podcast
        const plot = values.options["plot"] as string
        const name = values.options["name"]
        let title:string|undefined = undefined
        if (name) {
            title = (name as Podcast).name
        }
        return podcast.edit({
            plot, title
        })
    })

export const podcastDownload = new SubCommandBuilder()
    .setName("podcast episode")
    .setDescription("Download to a podcast")
    .addArgument(podcastSelectArgumentExists)
    .addArgument(new ArgumentBuilder<string>()
        .setName("link")
        .setDescription("the youtube url to download from (separate by comma), can be song or playlist url")
        .setParser(v => v.trim())
        .setValidator(v => validUrls(v))
        .setAutoComplete(v => ([v])))
    .setExecutionFunction<"async">(() => {
        return async (handler, values) => {
            const podcast = values.arguments[0] as Podcast
            const links = (values.arguments[1] as string).split(",")
            await podcast.download(handler, links)
            handler.done()
        }
    })

