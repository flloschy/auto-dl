import { CommandBuilder } from '$lib/commandManager/commandLib/Command';
import { albumEdit } from '$lib/metadataManager/Album';
import { episodeEdit } from '$lib/metadataManager/Episode';
import { podcastEdit } from '$lib/metadataManager/Podcast';
import { podcastEpisodeEdit } from '$lib/metadataManager/PodcastEpisode';
import { seasonEdit } from '$lib/metadataManager/Season';
import { showEdit } from '$lib/metadataManager/Show';

export default new CommandBuilder()
	.setName('edit')
	.setDescription('')
	.addSubCommand(podcastEdit)
	.addSubCommand(podcastEpisodeEdit)
	.addSubCommand(albumEdit)
	.addSubCommand(showEdit)
	.addSubCommand(seasonEdit)
	.addSubCommand(episodeEdit);
