<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onlyAscii } from '$lib/frontendUtil';
	import DateInput from '$lib/ui/components/DateInput.svelte';
	import Icon from '$lib/ui/components/Icon.svelte';
	import Popover from '$lib/ui/components/Popover.svelte';
	import Separator from '$lib/ui/components/Separator.svelte';
	import { toaster } from '$lib/ui/toast/toaster';

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

	const save = (e: { formData: FormData }) => {
		loadingId = toaster.loading('Saving Metadata');
		const newNFOData = data.albums[selectedIndex].nfo;

		Object.entries(newNFOData).forEach(([key, value]) => {
			if (key == 'originaltitle') return;
			e.formData.append(key, value);
		});

		e.formData.append('path', data.albums[selectedIndex].stats.location);
	};
	const sync = (e: { formData: FormData }) => {
		loadingId = toaster.loading('Syncing Playlist');

		e.formData.set('spotify', data.albums[selectedIndex].nfo.plot);
		e.formData.set('path', data.albums[selectedIndex].stats.location);
	};
	let selectedIndex = 0;
	let createDialog = false;
	let deleteDialog = false;
</script>

<form class="hidden" method="post" action="?/editMetadata" use:enhance={save}>
	<button id="saveButton"></button>
</form>
<form class="hidden" method="post" action="?/syncPlaylist" use:enhance={sync}>
	<button id="syncButton"></button>
</form>
<div class="flex gap-x-2 content-stretch md:flex-row flex-col">
	<div class="grid grid-cols-[auto_1fr] h-min">
		{#each data.albums as file, i}
			<div class="w-[24px]"></div>
			<button
				class:underline={selectedIndex == i}
				class="block text-left"
				on:click={() => (selectedIndex = i)}
				on:dblclick={() => goto(`spotdl/${data.albums[i].stats.location}`)}>{file.nfo.title}</button
			>
		{/each}
		<Icon code="playlist_add" class="!text-text-200" />
		<button class="block text-left" on:click={() => (createDialog = true)}>Create</button>
	</div>
	{#if data.albums.length != 0}
		<div>
			<h1 class="text-lg font-bold">Metadata</h1>
			<Separator />
			<div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3">
				<p>Title</p>
				<input
					placeholder="Title"
					bind:value={data.albums[selectedIndex].nfo.title}
					class="animation"
					on:keypress={onlyAscii}
				/>
				<p>Spotify URL</p>
				<input
					placeholder="Spotify"
					bind:value={data.albums[selectedIndex].nfo.plot}
					class="animation"
					on:keypress={onlyAscii}
				/>
				<p>Added</p>
				<DateInput
					bind:value={data.albums[selectedIndex].nfo.dateadded}
					class="animation bg-background-800"
				/>
				<button
					class="col-span-2 bg-background-700 p-2 rounded-xl animation text-primary-200"
					on:click={() => document.getElementById('saveButton')?.click()}>Save Metadata</button
				>
				<button
					class="col-span-2 bg-background-700 p-2 rounded-xl animation text-primary-200"
					on:click={() => document.getElementById('syncButton')?.click()}>Run Sync</button
				>
				<button
					class="col-span-2 bg-red-700 p-2 rounded-xl animation text-primary-200"
					on:click={() => (deleteDialog = true)}>Delete</button
				>
			</div>
			<h1 class="text-lg font-bold pt-3">Stats</h1>
			<Separator />
			<div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0">
				{#each Object.entries(data.albums[selectedIndex].stats) as [key, stat]}
					<p>{key}</p>
					<p>{stat}</p>
				{/each}
			</div>
		</div>
	{/if}
</div>

<Popover title="Create Show" bind:open={createDialog}>
	<form
		method="post"
		action="?/createPlaylist"
		class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3"
		use:enhance={(e) => {
			e.formData.forEach((value, key) => {
				if (value == '' || !value) e.formData.delete(key);
			});

			if (!e.formData.get('title')) {
				e.cancel();
				toaster.error('A title needs to be set!');
				return;
			}
			loadingId = toaster.loading('Creating Playlist');
		}}
	>
		<p>Name</p>
		<input
			placeholder="title"
			name="title"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<p>Spotify URL</p>
		<input
			placeholder="spotify url"
			name="plot"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<button class="animation bg-primary-700 p-2 rounded-xl col-span-2">Create</button>
	</form>
</Popover>

<Popover title="Confirm Delete" bind:open={deleteDialog}>
	<form
		method="post"
		action="?/deletePlaylist"
		use:enhance={(e) => {
			e.formData.set('path', data.albums[selectedIndex].stats.location);
			loadingId = toaster.loading('Deleting Playlist');
		}}
	>
		<p class="text-center">
			Are you sure you want to delete <b>{data.albums[selectedIndex].nfo.title}</b>?<br />
			This action CANNOT be reverted and will delete ALL songs!
		</p>
		<div class="flex justify-between pt-5">
			<button
				class="font-bold"
				on:click|preventDefault={() => {
					toaster.info('Deletion canceled');
					deleteDialog = false;
				}}>Cancel</button
			>
			<button class="text-red-600 font-bold">Delete</button>
		</div>
	</form>
</Popover>
