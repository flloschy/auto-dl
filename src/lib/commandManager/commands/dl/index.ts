import { CommandBuilder } from '$lib/commandManager/commandLib/Command';
import { albumDownload } from '$lib/metadataManager/Album';
import { podcastDownload } from '$lib/metadataManager/Podcast';
import { seasonDownload } from '$lib/metadataManager/Season';

export default new CommandBuilder()
	.setName('dl')
	.setDescription('Download content')
	.addSubCommand(podcastDownload)
	.addSubCommand(albumDownload)
	.addSubCommand(seasonDownload);
