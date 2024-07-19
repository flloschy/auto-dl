import type {
	EpisodeNFO,
	PodcastEpisodeNFO
} from '$lib/commandManager/commandUtility/metadata/types';
import {
	NFODateFormatter,
	clamp,
	cleanFlatObject,
	extractSectionsFromFile,
	getVideoIdFromYoutubeUrl,
	inRange,
	levenshtein,
	limitArrayLengthToX,
	pathAge,
	sortWithLevenshtein
} from '$lib/utility';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { SubCommandBuilder } from '$lib/commandManager/commandLib/Command';
import { ArgumentBuilder, OptionBuilder } from '$lib/commandManager/commandLib/Argument';
import { nfoTimeStampValidator } from '$lib/commandManager/commandUtility/metadata/validators';
import { nfoTimeStampAutocomplete } from '$lib/commandManager/commandUtility/metadata/autocompletes';
import { getDuration } from '$lib';
import { Show } from './Show';
import { Season } from './Season';
import { folderListAutocomplete } from '$lib/commandManager/commandUtility/general/autocompletes';

export class Episode {
	name: string;
	metadata: PodcastEpisodeNFO;
	exists: boolean;
	show: Show;
	season: Season;
	constructor(show: Show, season: Season, episode: string) {
		this.show = show;
		this.season = season;
		this.name = episode;
		this.exists = existsSync(
			`./downloads/video/${this.show.name}/${this.season.name}/${this.name}`
		);

		const title = this.name.replaceAll('[', '').replaceAll(']', '').split('.')[0];
		this.metadata = {
			dateadded: NFODateFormatter(
				this.exists
					? pathAge(`./downloads/video/${this.show.name}/${this.season.name}/${this.name}`)
					: 0
			),
			originaltitle: this.name,
			title: title,
			plot: '',
			aired: NFODateFormatter(new Date()),
			runtime: '00:00:00',
			youtubemetadataid: title,
			episode: (
				readdirSync(`./downloads/video/${this.show.name}/${this.season.name}/`, {
					withFileTypes: true
				}).filter(
					(d) =>
						d.isFile() &&
						!d.name.endsWith('nfo') &&
						!d.name.endsWith('json') &&
						!d.name.includes('temp') &&
						!d.name.includes('tmp')
				).length + 1
			).toString()
		};
		this.load();
	}

	private load() {
		const segments = extractSectionsFromFile(
			`./downloads/video/${this.show.name}/${this.season.name}/${this.name}`
		);
		if (existsSync(`${segments.path}/${segments.fileName}.nfo`)) {
			const fileData = readFileSync(`${segments.path}/${segments.fileName}.nfo`);
			const xml = new XMLParser().parse(fileData);
			const nfo = xml.episodedetails as EpisodeNFO;
			if (nfo) {
				nfo.trailer = nfo.trailer.replace(
					'plugin://plugin.video.youtube/?action=play_video&videoid=',
					''
				);
				this.metadata = nfo;
			}
		}
	}

	async writeNfo() {
		this.metadata.runtime = await getDuration(
			`video/${this.show.name}/${this.season.name}/${this.name}`
		);

		const data = new XMLBuilder({
			indentBy: '\t',
			format: true
		}).build({ episodedetails: this.metadata });

		const segments = extractSectionsFromFile(
			`./downloads/video/${this.show.name}/${this.season.name}/${this.name}`
		);
		writeFileSync(`${segments.path}/${segments.fileName}.nfo`, data);

		return {
			success: true,
			lines: [['updated!']]
		};
	}

	async edit(overwrite: Partial<EpisodeNFO>) {
		if (overwrite.trailer) {
			const id = getVideoIdFromYoutubeUrl(overwrite.trailer);
			if (id) {
				overwrite.trailer = `plugin://plugin.video.youtube/?action=play_video&videoid=${id}`;
			} else {
				overwrite.trailer = '';
			}
		}
		overwrite = cleanFlatObject(overwrite);
		this.metadata = { ...this.metadata, ...overwrite };

		return await this.writeNfo();
	}

	delete() {
		if (!this.exists)
			return {
				success: false,
				lines: [["podcast doesn't exist"]]
			};

		const episodes = this.season
			.episodes()
			.filter((e) => parseInt(e.metadata.episode) > parseInt(this.metadata.episode));

		for (let index = 0; index < episodes.length; index++) {
			const ep = episodes[index];
			ep.edit({
				episode: (parseInt(ep.metadata.episode) - 1).toString()
			});
		}

		const segments = extractSectionsFromFile(
			`./downloads/video/${this.show.name}/${this.season.name}/${this.name}`
		);
		rmSync(`${segments.path}/${segments.fileName}.webm`, {
			force: true,
			recursive: true
		});
		rmSync(`${segments.path}/${segments.fileName}.mp4`, {
			force: true,
			recursive: true
		});
		rmSync(`${segments.path}/${segments.fileName}.nfo`, {
			force: true,
			recursive: true
		});
		rmSync(`${segments.path}/${segments.fileName}.info.json`, {
			force: true,
			recursive: true
		});
		return {
			success: true,
			lines: [['podcast deleted']]
		};
	}
}
const seasonExistsArgument = new ArgumentBuilder<Season>()
	.setName('season')
	.setDescription('select a season')
	.setDisplayedType('string')
	.setParser((v, values) => {
		const show = values.arguments[0] as Show;
		const season = new Season(show, { name: v });
		if (season.exists) {
			return season;
		}
		return new Season(show, { folder: v });
	})
	.setValidator((v) => v.exists)
	.setAutoComplete((v, values) => {
		const show = values.arguments[0] as Show;
		return show
			.seasons()
			.filter((s) => s.name != v.name && s.metadata.title != v.metadata.title)
			.sort((a, b) => {
				const aScore = Math.max(
					levenshtein(a.name, v.name) + levenshtein(a.metadata.title, v.metadata.title)
				);
				const bScore = Math.max(
					levenshtein(b.name, v.name) + levenshtein(b.metadata.title, v.metadata.title)
				);
				return aScore - bScore;
			})
			.slice(0, 10)
			.map((v) => v.name);
	});
const showSelectArgumentExists = new ArgumentBuilder<Show>()
	.setName('name')
	.setDescription('The name of the show')
	.setDisplayedType('string')
	.setParser((name) => new Show(name))
	.setValidator((sho) => sho.exists)
	.setAutoComplete((sho) => folderListAutocomplete('video', sho.name));

const selectEpisode = new ArgumentBuilder<Episode>()
	.setName('episode')
	.setDescription('Select the episode')
	.setDisplayedType('string')
	.setParser((name, values) => {
		const show = values.arguments[0] as Show;
		const season = values.arguments[1] as Season;
		return new Episode(show, season, name);
	})
	.setValidator((ep) => ep.exists)
	.setAutoComplete((ept, values) => {
		const show = values.arguments[0] as Show;
		const season = values.arguments[1] as Season;
		return limitArrayLengthToX(
			sortWithLevenshtein(
				readdirSync(`./downloads/video/${show.name}/${season.name}`, { withFileTypes: true })
					.filter((dir) => dir.isFile() && !dir.name.endsWith('nfo') && !dir.name.endsWith('json'))
					.map((dir) => dir.name),
				ept.name
			),
			10
		);
	});

export const episodeRemove = new SubCommandBuilder()
	.setName('episode')
	.setDescription('select a podcast episode')
	.addArgument(showSelectArgumentExists)
	.addArgument(seasonExistsArgument)
	.addArgument(selectEpisode)
	.setExecutionFunction((values) => {
		const episode = values.arguments[2] as Episode;
		return episode.delete();
	});

export const episodeEdit = new SubCommandBuilder()
	.setName('episode')
	.setDescription('select a podcast episode')
	.addArgument(showSelectArgumentExists)
	.addArgument(seasonExistsArgument)
	.addArgument(selectEpisode)
	.addOption(
		new OptionBuilder<string>()
			.setName('title')
			.setDescription('the new title')
			.setDisplayedType('string')
			.setParser((v) => v.trim())
			.setValidator(() => true)
			.setAutoComplete((v) => [v])
	)
	.addOption(
		new OptionBuilder<string>()
			.setName('plot')
			.setDescription('the new description')
			.setDisplayedType('string')
			.setParser((v) => v.trim())
			.setValidator(() => true)
			.setAutoComplete((v) => [v])
	)
	.addOption(
		new OptionBuilder<string>()
			.setName('aired')
			.setDescription('the time when the episode was released')
			.setDisplayedType('string')
			.setParser((v) => v.trim())
			.setValidator(nfoTimeStampValidator)
			.setAutoComplete(nfoTimeStampAutocomplete)
	)
	.addOption(
		new OptionBuilder<number>()
			.setName('episode')
			.setDescription('move an episode to another position')
			.setDisplayedType('number')
			.setParser((x) => parseInt(x) || 0)
			.setValidator((x, values) => {
				const episodes = (values.arguments[1] as Season).episodes().length;
				return inRange(x, 0, episodes);
			})
			.setAutoComplete((x, values) => {
				const episodes = (values.arguments[1] as Season).episodes().length;
				const ep = values.arguments[2] as Episode;

				return [
					1,
					clamp(x - 1, 1, episodes),
					clamp(x, 1, episodes),
					clamp(x + 1, 1, episodes),
					episodes
				]
					.map((x) => x.toString())
					.filter((v, i, a) => a.indexOf(v) == i && v != ep.metadata.episode);
			})
	)
	.setExecutionFunction<'instant'>(async (values) => {
		const season = values.arguments[1] as Season;
		const ep = values.arguments[2] as Episode;

		const title = values.options['title'];
		const aired = values.options['aired'];
		const plot = values.options['plot'];
		const episodeNew = values.options['episode'];
		const episodeOld = parseInt(ep.metadata.episode);

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

			const forwards = episodeNew < episodeOld;

			const episodes = season.episodes();

			const min = Math.min(episodeNew, episodeOld);
			const max = Math.max(episodeNew, episodeOld);
			const diff = max - min;

			if (diff == 0) {
				/* empty */
			} else if (diff == 1) {
				await episodes
					.find((x) => parseInt(x.metadata.episode) == episodeNew)
					?.edit({ episode: episodeOld.toString() });
			} else {
				for (let index = 0; index < episodes.length; index++) {
					const current = index + 1;
					const currentEpisode = episodes[index];

					if (inRange(current, min, max)) {
						await currentEpisode.edit({
							episode: (current + (forwards ? +1 : -1)).toString()
						});
					}
				}
			}
		}

		return await ep.edit({
			title,
			aired,
			plot,
			episode: episodeNew
		});
	});
