<script lang="ts">
	import { enhance } from '$app/forms';
	import { onlyAscii } from '$lib/frontendUtil';
	import Icon from '$lib/ui/components/Icon.svelte';
	import Popover from '$lib/ui/components/Popover.svelte';
	import Separator from '$lib/ui/components/Separator.svelte';
	import { toaster } from '$lib/ui/toast/toaster';
	import { onMount } from 'svelte';

	export let data;
	export let form;
	let loadingId: string | undefined = '';
	$: if (form) {
		if (loadingId) {
			if (form.success) {
				toaster.resolve(loadingId, 'success', form.success.title, form.success.details);
			} else if (form.error) {
				toaster.resolve(loadingId, 'error', form.error.title, form.error.details);
			}
			loadingId = undefined;
		}
	}

	let selectedIndex = 0;
	let downloadSongDialog = false;
	let downloadPlaylistDialog = false;
	let deleteDialog = false;
	let lyrics = '';
	onMount(() => {
		if (data.songs.length != 0) {
			const id = toaster.loading('Fetching Lyrics');

			fetch(`/spotdl/${data.playlist}/lyrics?path=${data.songs[0].location}`).then((response) => {
				if (response.status == 200) {
					response.text().then((t) => (lyrics = t));
					toaster.resolve(id, 'success', 'Fetched!');
				} else {
					toaster.resolve(id, 'error', 'Fetching Failed');
				}
			});
		}
	});
</script>

<div class="flex gap-x-2 content-stretch md:flex-row flex-col-reverse">
	<div class="grid grid-cols-[auto_1fr] h-min">
		{#each data.songs as file, i}
			<div class="w-[24px]"></div>
			<button
				class:underline={selectedIndex == i}
				class="block text-left"
				on:click={async () => {
					if (selectedIndex == i) return;
					selectedIndex = i;
					const id = toaster.loading('Fetching Lyrics');

					const response = await fetch(
						`/spotdl/${data.playlist}/lyrics?path=${data.songs[selectedIndex].location}`
					);
					if (response.status == 200) {
						lyrics = await response.text();
						toaster.resolve(id, 'success', 'Fetched!');
					} else {
						toaster.resolve(id, 'error', 'Fetching Failed');
					}
				}}
				>{file.title}
			</button>
		{/each}
		<Icon code="file_save" class="!text-text-200" />
		<button class="block text-left" on:click={() => (downloadSongDialog = true)}
			>Download Song</button
		>
		<Icon code="download" class="!text-text-200" />
		<button class="block text-left" on:click={() => (downloadPlaylistDialog = true)}
			>Download Playlist</button
		>
	</div>
	{#if data.songs.length != 0}
		<form method="post" action="?/updateLyrics">
			<h1 class="text-lg font-bold">Metadata</h1>
			<Separator />
			<div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3">
				{#each Object.entries(data.songs[selectedIndex]) as [key, stat]}
					<p>{key}</p>
					<p>{stat}</p>
				{/each}
				<button
					class="col-span-2 bg-red-700 p-2 rounded-xl animation text-primary-200"
					on:click|preventDefault={() => (deleteDialog = true)}>Delete</button
				>
			</div>
			<Separator />
			<h1 class="text-lg font-bold mb-2">Lyrics</h1>
			<textarea placeholder="[00:00:00.00] text" name="lyrics" class="w-[100%]" rows="20"
				>{lyrics}</textarea
			>
			<input type="hidden" value={data.songs[selectedIndex].location} name="path" />
			<button class="w-[100%] p-2 bg-background-800 rounded-xl animation">Update Lyrics</button>
		</form>
	{/if}
</div>

<Popover title="Download Song" bind:open={downloadSongDialog}>
	<form
		method="post"
		action="?/downloadSong"
		class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3"
		use:enhance={(e) => {
			e.formData.forEach((value, key) => {
				if (value == '' || !value) e.formData.delete(key);
			});

			if (!e.formData.get('spotify')) {
				e.cancel();
				toaster.error('A Spotify link needs to be set!');
				return;
			}
			loadingId = toaster.loading('Downloading Song');
			e.formData.set('toastId', loadingId);
		}}
	>
		<p>Spotify URL</p>
		<input
			placeholder="Spotify URL"
			name="spotify"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<p
			class="underline"
			title="(optional) the youtube url to download the audio from, then the spotify link will only be used for metadata"
		>
			Youtube URL
		</p>
		<input
			placeholder="Youtube URL"
			name="youtube"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<button class="animation bg-primary-700 p-2 rounded-xl col-span-2">Download</button>
	</form>
</Popover>

<Popover title="Download Playlist" bind:open={downloadPlaylistDialog}>
	<form
		method="post"
		action="?/downloadSong"
		class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3"
		use:enhance={(e) => {
			e.formData.forEach((value, key) => {
				if (value == '' || !value) e.formData.delete(key);
			});

			if (!e.formData.get('spotify')) {
				e.cancel();
				toaster.error('A Spotify link needs to be set!');
				return;
			}
			loadingId = toaster.loading('Downloading Song');
			e.formData.set('toastId', loadingId);
		}}
	>
		<p>Spotify URL</p>
		<input
			placeholder="Spotify URL"
			name="spotify"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<button class="animation bg-primary-700 p-2 rounded-xl col-span-2">Download</button>
	</form>
</Popover>

<Popover title="Confirm Delete" bind:open={deleteDialog}>
	<form
		method="post"
		action="?/deleteSong"
		use:enhance={(e) => {
			e.formData.set('path', data.songs[selectedIndex].location);
			loadingId = toaster.loading('Deleting Playlist');
		}}
	>
		<p class="text-center">
			Are you sure you want to delete <b>{data.songs[selectedIndex].title}</b>?<br />
			This action CANNOT be reverted!
		</p>
		<div class="flex justify-between pt-5">
			<button
				class="font-bold"
				on:click|preventDefault={() => {
					toaster.info('Deletion canceled');
				}}>Cancel</button
			>
			<button class="text-red-600 font-bold">Delete</button>
		</div>
	</form>
</Popover>
