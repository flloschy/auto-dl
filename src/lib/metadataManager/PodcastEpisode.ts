import type { PodcastEpisodeNFO } from "$lib/commandManager/commandUtility/metadata/types";
import { NFODateFormatter, clamp, cleanFlatObject, extractSectionsFromFile, inRange, limitArrayLengthToX, pathAge, sortWithLevenshtein } from "$lib/utility";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { Podcast } from "./Podcast";
import { SubCommandBuilder } from "$lib/commandManager/commandLib/Command";
import { ArgumentBuilder, OptionBuilder } from "$lib/commandManager/commandLib/Argument";
import { folderListAutocomplete } from "$lib/commandManager/commandUtility/general/autocompletes";
import { nfoTimeStampValidator } from "$lib/commandManager/commandUtility/metadata/validators";
import { nfoTimeStampAutocomplete } from "$lib/commandManager/commandUtility/metadata/autocompletes";
import { getDuration } from "$lib";

export class PodcastEpisode {
    name: string;
    metadata: PodcastEpisodeNFO;
    exists: boolean;
    podcast: Podcast
    constructor (podcast: Podcast,episode: string) {
        this.podcast = podcast
        this.name = episode
        this.exists = existsSync(`./downloads/podcast/${this.podcast.name}/${this.name}`)

        const title = this.name.replaceAll("[", "").replaceAll("]", "").replace(".mp3", "")
        this.metadata = {
            dateadded: NFODateFormatter(this.exists ? pathAge(`./downloads/podcast/${this.podcast.name}/${this.name}`) : 0),
            originaltitle: this.name,
            title: title,
            plot: "",
            aired: NFODateFormatter(new Date()),
            runtime: "00:00:00",
            youtubemetadataid: title,
            episode: readdirSync(`./downloads/podcast/${this.podcast.name}`, {withFileTypes: true}).filter(d => d.isFile() && d.name.endsWith(".mp3")).length.toString()
        }
        this.load()
    }

    private load() {
        const segments = extractSectionsFromFile(`./downloads/podcast/${this.podcast.name}/${this.name}`)
        if (existsSync(`${segments.path}/${segments.fileName}.nfo`)) {
            const fileData = readFileSync(`${segments.path}/${segments.fileName}.nfo`)
            const xml = new XMLParser().parse(fileData)
            const nfo = xml.episodedetails
            if (nfo) {
                this.metadata = nfo
            }
        }
    }

    async writeNfo() {
        this.metadata.runtime = await getDuration(`podcast/${this.podcast.name}/${this.name}`)

        const data = new XMLBuilder({
            indentBy: "\t",
            format: true
        }).build({episodedetails: this.metadata})

        const segments = extractSectionsFromFile(`./downloads/podcast/${this.podcast.name}/${this.name}`)
        writeFileSync(`${segments.path}/${segments.fileName}.nfo`, data)

        return {
            success: true,
            lines: [["updated!"]]
        }
    }

    async edit(overwrite: Partial<PodcastEpisodeNFO>) {
        overwrite = cleanFlatObject(overwrite)
        this.metadata = {...this.metadata, ...overwrite}
        return await this.writeNfo()
    }

    delete() {
        if (!this.exists) return {
            success: false,
            lines: [["podcast doesn't exist"]]
        }

        const episodes = this.podcast.episodes().filter(e => parseInt(e.metadata.episode) > parseInt(this.metadata.episode))

        for (let index = 0; index < episodes.length; index++) {
            const ep = episodes[index];
            ep.edit({
                episode: (parseInt(ep.metadata.episode) - 1).toString()
            })
        }

        const segments = extractSectionsFromFile(`./downloads/podcast/${this.podcast.name}/${this.name}`)
        rmSync(`${segments.path}/${segments.fileName}.mp3`, {
            force: true,
            recursive: true
        })
        rmSync(`${segments.path}/${segments.fileName}.nfo`, {
            force: true,
            recursive: true
        })
        rmSync(`${segments.path}/${segments.fileName}.info.json`, {
            force: true,
            recursive: true
        })
        return {
            success: true,
            lines: [["podcast deleted"]]
        }
    }
}

const selectPodcast = new ArgumentBuilder<Podcast>()
    .setName("podcast")
    .setDescription("Select the podcast")
    .setDisplayedType("string")
    .setParser(name => new Podcast(name))
    .setValidator(pod => pod.exists)
    .setAutoComplete(pod => folderListAutocomplete("podcast", pod.name))
const selectEpisode = new ArgumentBuilder<PodcastEpisode>()
    .setName("episode")
    .setDescription("Select the episode")
    .setDisplayedType("string")
    .setParser((name, values) => {
        const podcast = values.arguments[0] as Podcast
        return new PodcastEpisode(podcast, name)
    })
    .setValidator(ep => ep.exists)
    .setAutoComplete((pod, values) => {
        const podcast = values.arguments[0] as Podcast
        return limitArrayLengthToX(
            sortWithLevenshtein(
                readdirSync(`./downloads/podcast/${podcast.name}`, {withFileTypes: true})
                    .filter(dir => dir.isFile() && dir.name.endsWith(".mp3"))
                    .map(dir => dir.name),
                pod.name
            ),
            10
        )
    })


export const podcastEpisodeRemove = new SubCommandBuilder()
    .setName("podcast episode")
    .setDescription("select a podcast episode")
    .addArgument(selectPodcast)
    .addArgument(selectEpisode)
    .setExecutionFunction((values) => {
        const episode = values.arguments[1] as PodcastEpisode
        return episode.delete()
    })

export const podcastEpisodeEdit = new SubCommandBuilder()
    .setName("podcast episode")
    .setDescription("select a podcast episode")
    .addArgument(selectPodcast)
    .addArgument(selectEpisode)
    .addOption(new OptionBuilder<string>()
        .setName("title")
        .setDescription("the new title")
        .setDisplayedType("string")
        .setParser(v => v.trim())
        .setValidator(() => true)
        .setAutoComplete(v => ([v])))
    .addOption(new OptionBuilder<string>()
        .setName("plot")
        .setDescription("the new description")
        .setDisplayedType("string")
        .setParser(v => v.trim())
        .setValidator(() => true)
        .setAutoComplete(v => ([v])))
    .addOption(new OptionBuilder<string>()
        .setName("aired")
        .setDescription("the time when the episode was released")
        .setDisplayedType("string")
        .setParser(v => v.trim())
        .setValidator(nfoTimeStampValidator)
        .setAutoComplete(nfoTimeStampAutocomplete))
    .addOption(new OptionBuilder<number>()
        .setName("episode")
        .setDescription("move an episode to another position")
        .setDisplayedType("number")
        .setParser(x => parseInt(x) || 0)
        .setValidator((x, values) => {
            const episodes = (values.arguments[0] as Podcast).episodes().length
            return inRange(x, 0, episodes)
        })
        .setAutoComplete((x, values) => {
            const ep = values.arguments[1] as PodcastEpisode
            const episodes = (values.arguments[0] as Podcast).episodes().length
            console.log(x, episodes)
            return [
                1,
                clamp(x-1, 1, episodes),
                clamp(x, 1, episodes),
                clamp(x+1, 1, episodes),
                episodes
            ]
            .map(x => x.toString())
            .filter((v, i, a) => a.indexOf(v) == i && v != ep.metadata.episode)
        }))
    .setExecutionFunction<"instant">(async (values) => {
        const podcast = values.arguments[0] as Podcast
        const podcastEp = values.arguments[1] as PodcastEpisode

        const title = values.options["title"]
        const aired = values.options["aired"]
        const plot = values.options["plot"]
        const episodeNew = values.options["episode"]
        const episodeOld = parseInt(podcastEp.metadata.episode)

        if (episodeNew != undefined) {
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

            const forwards = episodeNew < episodeOld

            const episodes = podcast.episodes()

            const min = Math.min(episodeNew, episodeOld)
            const max = Math.max(episodeNew, episodeOld)
            const diff = max - min

            if (diff == 0) { /* empty */ }
            else if (diff == 1) {
                await (episodes.find(x => parseInt(x.metadata.episode) == episodeNew))?.edit({episode: episodeOld.toString()})
            } else {
                for (let index = 0; index < episodes.length; index++) {
                    const current = index+1
                    const currentEpisode = episodes[index];
                    console.log(index, currentEpisode.metadata)

                    if (inRange(current, min, max)) {
                        await currentEpisode.edit({
                            episode: (current + (forwards ? +1 : -1)).toString()
                        })
                    }
                }
            }
        }

        return await podcastEp.edit({
            title, aired, plot, episode: episodeNew
        })
    })