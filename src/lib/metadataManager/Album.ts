import { getYoutubePlaylistIds, downloadYoutubeSong, downloadSpotifySong, downloadSpotifyPlaylist } from "$lib";
import { ArgumentBuilder, OptionBuilder } from "$lib/commandManager/commandLib/Argument";
import { SubCommandBuilder } from "$lib/commandManager/commandLib/Command";
import type { ExecutionHandler } from "$lib/commandManager/commandLib/Execution";
import { folderListAutocomplete } from "$lib/commandManager/commandUtility/general/autocompletes";
import { validExistingFileName, validUrls } from "$lib/commandManager/commandUtility/general/validators";
import type { AlbumNFO } from "$lib/commandManager/commandUtility/metadata/types";
import { NFODateFormatter, cleanFlatObject, cleanName, extractSectionsFromFile, getPlaylistIdFromYoutubeUrl, isCleaned, limitArrayLengthToX, pathAge, sortWithLevenshtein } from "$lib/utility";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "fs";

export class Album {
    name: string;
    metadata: AlbumNFO;
    exists: boolean;
    constructor (podcast: string) {

        this.name = podcast
        this.exists = existsSync(`./downloads/music/${this.name}`)

        this.metadata = {
            dateadded: NFODateFormatter(this.exists ? pathAge(`./downloads/music/${this.name}`) : 0),
            originaltitle: this.name,
            title: this.name,
            plot: "",
        }
        this.load()
    }

    private load() {
        if (existsSync(`./downloads/music/${this.name}/album.nfo`)) {
            const fileData = readFileSync(`./downloads/music/${this.name}/album.nfo`)
            const xml = new XMLParser().parse(fileData)
            const nfo = xml.album
            if (nfo) {
                this.metadata = nfo
            }
        }
    }

    create() {
        const podcasts = readdirSync(`./downloads/music`)
        if (podcasts.includes(this.name)) return {
            success: false,
            lines: [["podcast already exists"]]
        }

        mkdirSync(`./downloads/music/${this.name}`)
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

        writeFileSync(`./downloads/music/${this.name}/album.nfo`, data)

        return {
            success: true,
            lines: [["updated!"]]
        }
    }

    edit(overwrite: Partial<AlbumNFO>) {
        overwrite = cleanFlatObject(overwrite)
        const updatedName = this.metadata.title != overwrite.title
        this.metadata = {...this.metadata, ...overwrite}

        const result = this.writeNfo()

        if (updatedName && overwrite.title) {
            renameSync(`./downloads/music/${this.name}`, `./downloads/music/${cleanName(overwrite.title)}`)
            this.name = cleanName(overwrite.title)
        }

        return result

    }

    delete() {
        if (!this.exists) return {
            success: false,
            lines: [["podcast doesn't exist"]]
        }

        rmSync(`./downloads/music/${this.name}`, {
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

            const playlist = link.includes("playlist")
            const spotify = link.includes("spotify")
            const youtube = link.includes("youtube") || link.includes("youtu.be")

            if (playlist) {
                if (spotify && !youtube) {
                    await downloadSpotifyPlaylist(handler, this.name, link)
                } else if (!spotify && youtube) {
                    const playlistId = getPlaylistIdFromYoutubeUrl(link)
                    if (!playlistId) continue
                    const playlistIds = await getYoutubePlaylistIds(playlistId)
                    for (let index2 = 0; index2 < playlistIds.length; index2++) {
                        const id = playlistIds[index2];
                        await downloadYoutubeSong(handler, this.name, `https://youtu.be/${id}`, "music", false)
                    }
                } else {
                    handler.log(["invalid link", link])
                }
            } else {
                if (spotify && youtube && link.includes("|")) {
                    await downloadSpotifySong(handler, this.name, link)
                } else if (spotify && !youtube) {
                    await downloadSpotifySong(handler, this.name, link)
                } else if (!spotify && youtube) {
                    await downloadYoutubeSong(handler, this.name, link, "music", false)
                } else {
                    handler.log(["invalid link", link])
                }
            }

        }

    }
}

const albumSelectArgumentExists = new ArgumentBuilder<Album>()
    .setName("name")
    .setDescription("The name of the new album")
    .setDisplayedType("string")
    .setParser(name => new Album(name))
    .setValidator(alb => alb.exists)
    .setAutoComplete(alb => folderListAutocomplete("music", alb.name))

const albumSelectArgumentNew = new ArgumentBuilder<Album>()
    .setName("name")
    .setDescription("The name of the new album")
    .setDisplayedType("string")
    .setParser(name => new Album(name))
    .setValidator(alb => !alb.exists && isCleaned(alb.name))
    .setAutoComplete(alb => ([
        cleanName(alb.name)
    ]))

const plotOption = new OptionBuilder<string>()
    .setName("plot")
    .setDescription("A little description about what the album is about")
    .setDisplayedType("string")
    .setParser(v => v.trim())
    .setValidator(() => true)
    .setAutoComplete(v => ([v]))

export const albumCreate = new SubCommandBuilder()
    .setName("album")
    .setDescription("Create a new album")
    .addArgument(albumSelectArgumentNew)
    .addOption(plotOption)
    .setExecutionFunction<"instant">((values) => {
        const album = values.arguments[0] as Album
        const plot = values.options["plot"] as string
        if (plot) {
            album.metadata.plot = plot
        }
        return album.create()
    })

export const albumRemove = new SubCommandBuilder()
    .setName("album")
    .setDescription("Delete a album and all of its episodes")
    .addArgument(albumSelectArgumentExists)
    .setExecutionFunction<"instant">((values) => {
        const album = values.arguments[0] as Album
        return album.delete()
    })

export const albumEdit = new SubCommandBuilder()
    .setName("album")
    .setDescription("Edit metadata from a podcast")
    .addArgument(albumSelectArgumentExists)
    .addOption(plotOption)
    .addOption(albumSelectArgumentNew.toOptional())
    .setExecutionFunction<"instant">((values) => {
        const album = values.arguments[0] as Album
        const plot = values.options["plot"] as string
        const name = values.options["name"]
        let title:string|undefined = undefined
        if (name) {
            title = (name as Album).name
        }
        return album.edit({
            plot, title
        })
    })

export const albumDownload = new SubCommandBuilder()
    .setName("song")
    .setDescription("Download to a album")
    .addArgument(albumSelectArgumentExists)
    .addArgument(new ArgumentBuilder<string>()
        .setName("link")
        .setDescription("spotify/youtube link or links separated by comma (\"youtube|spotify\" to download via youtube link and spotify metadata)")
        .setParser(v => v.trim())
        .setValidator(v => validUrls(v))
        .setAutoComplete(v => ([v])))
    .setExecutionFunction<"async">(() => {
        return async (handler, values) => {
            const album = values.arguments[0] as Album
            const links = (values.arguments[1] as string).split(",")
            await album.download(handler, links)
            handler.done()
        }
    })
export const songDelete = new SubCommandBuilder()
    .setName("song")
    .setDescription("Download to a album")
    .addArgument(albumSelectArgumentExists)
    .addArgument(new ArgumentBuilder<string>()
        .setName("song")
        .setDescription("")
        .setDisplayedType("string")
        .setParser(v => v.trim())
        .setValidator((value, values) => {
            const alb = values.arguments[0] as Album
            return validExistingFileName(`music/${alb.name}`, value)
        })
        .setAutoComplete((value, values) => {
            const alb = values.arguments[0] as Album
            return limitArrayLengthToX(
                sortWithLevenshtein(
                    readdirSync(`./downloads/music/${alb.name}`, {withFileTypes: true})
                        .filter(dir => dir.isFile() && dir.name.endsWith(".mp3"))
                        .map(dir => dir.name),
                    value
                ),
                10
            )
        }))
    .setExecutionFunction<"instant">((values) => {
        const album = values.arguments[0] as Album
        const song = values.arguments[1] as string
        const segments = extractSectionsFromFile(`./downloads/music/${album.name}/${song}`)

        try { rmSync(`${segments.path}/${segments.fileName}.mp3`) } catch { /*empty*/ }
        try { rmSync(`${segments.path}/${segments.fileName}.lrc`) } catch { /*empty*/ }

        return {
            success: true,
            lines: [["deleted"]]
        }
    })


