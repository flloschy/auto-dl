import { CommandBuilder } from "$lib/commandManager/commandLib/Command";
import { albumRemove, songDelete as songRemove } from "$lib/metadataManager/Album";
import { episodeRemove } from "$lib/metadataManager/Episode";
import { podcastRemove } from "$lib/metadataManager/Podcast";
import { podcastEpisodeRemove } from "$lib/metadataManager/PodcastEpisode";
import { showRemove } from "$lib/metadataManager/Show";

export default new CommandBuilder()
    .setName("rm")
    .setDescription("Delete media or a media folder")
    .addSubCommand(podcastRemove)
    .addSubCommand(podcastEpisodeRemove)
    .addSubCommand(albumRemove)
    .addSubCommand(songRemove)
    .addSubCommand(showRemove)
    .addSubCommand(episodeRemove)