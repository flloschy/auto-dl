import { CommandBuilder } from '$lib/commandManager/commandLib/Command';
import { albumCreate } from '$lib/metadataManager/Album';
import { podcastCreate } from '$lib/metadataManager/Podcast';
import { seasonCreate } from '$lib/metadataManager/Season';
import { showCreate } from '$lib/metadataManager/Show';

export default new CommandBuilder()
	.setName('mk')
	.setDescription('Create a new media folder')
	.addSubCommand(podcastCreate)
	.addSubCommand(albumCreate)
	.addSubCommand(showCreate)
	.addSubCommand(seasonCreate);
