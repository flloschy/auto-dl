<script lang="ts">
	import { enhance } from '$app/forms';
	import DateInput from '$lib/ui/components/DateInput.svelte';
	import Icon from '$lib/ui/components/Icon.svelte';
	import Popover from '$lib/ui/components/Popover.svelte';
	import Separator from '$lib/ui/components/Separator.svelte';
	export let data;
	let selectedIndex: number = 0;

	import { toaster } from '$lib/ui/toast/toaster';
	export let form;
	let loadingId: string | undefined;
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
		const newNFOData = data.files[selectedIndex].nfo;

		Object.entries(newNFOData).forEach(([key, value]) => {
			if (key == 'originaltitle') return;
			e.formData.append(key, value);
		});

		e.formData.append('path', data.files[selectedIndex].stats.location);
	};
	const remove = (e: { formData: FormData }) => {
		loadingId = toaster.loading('Delete Episode');
		e.formData.append('path', data.files[selectedIndex].stats.location);
	};
	let reorders = 0;
	const reorderAction = (i: number) => {
		if (i == 0) return;

		[data.files[i], data.files[i - 1]] = [data.files[i - 1], data.files[i]];

		reorders++;
		let reorder = reorders;
		setTimeout(() => {
			if (reorders != reorder) return;
			document.getElementById('reorderButton')?.click();
		}, 1000);
	};

	const reorder = (e: { formData: FormData }) => {
		loadingId = toaster.loading('Reordering Episodes');
		e.formData.set('newOrder', data.files.map((v) => v.nfo.episode).join(','));
	};

	let deleteDialog = false;
	let downloadDialogVideo = false;
	let downloadDialogPlaylist = false;
</script>

<!-- Utility Forms. Required because else the `form` value wont update -->
<form class="hidden" method="post" action="?/reorderEpisode" use:enhance={reorder}>
	<button id="reorderButton"></button>
</form>

<form class="hidden" method="post" action="?/editMetadata" use:enhance={save}>
	<button id="saveButton"></button>
</form>

<form class="hidden" method="post" action="?/deleteEpisode" use:enhance={remove}>
	<button id="deleteButton"></button>
</form>

<!-- The interface -->
<div class="flex gap-x-2 content-stretch md:flex-row flex-col-reverse">
	<div class="grid grid-cols-[auto_1fr] h-min">
		<!-- List of Episodes -->
		{#each data.files as file, i}
			<button class="h-[24px]" on:click={() => reorderAction(i)}>
				<Icon code="keyboard_arrow_up" class="!text-text-200" info="Move up" />
			</button>
			<button
				class="block text-left"
				class:underline={selectedIndex == i}
				on:click={() => (selectedIndex = i)}>{file.nfo.title}</button
			>
		{/each}
		<!-- Spacer -->
		<div class="h-[20px]" />
		<div />
		<!-- Actions -->
		<Icon code="file_save" class="!text-text-200" />
		<button class="block text-left" on:click={() => (downloadDialogVideo = true)}
			>Download Video</button
		>
		<Icon code="download" class="!text-text-200" />
		<button class="block text-left" on:click={() => (downloadDialogPlaylist = true)}
			>Download Playlist</button
		>
	</div>

	{#if data.files.length != 0}
		<div>
			<div class="sticky top-0">
				<!-- Metadata Inspector  -->
				<h1 class="text-lg font-bold">Metadata</h1>
				<Separator />
				<div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3">
					<p>Title</p>
					<input
						bind:value={data.files[selectedIndex].nfo.title}
						class="animation"
						placeholder="Title"
					/>
					<p>Description</p>
					<textarea
						class="animation"
						bind:value={data.files[selectedIndex].nfo.plot}
						placeholder="Description"
					/>
					<p>Released</p>
					<DateInput
						bind:value={data.files[selectedIndex].nfo.aired}
						class="animation bg-background-800"
					/>
					<p>Added</p>
					<DateInput
						bind:value={data.files[selectedIndex].nfo.dateadded}
						class="animation bg-background-800"
					/>
					<p>Video ID</p>
					<input
						bind:value={data.files[selectedIndex].nfo.youtubemetadataid}
						placeholder="video Id"
					/>
					<p>Added</p>
					<DateInput
						bind:value={data.files[selectedIndex].nfo.dateadded}
						class="animation bg-background-800"
					/>
					<button
						class="col-span-2 bg-background-700 p-2 rounded-xl animation text-primary-200"
						on:click={() => document.getElementById('saveButton')?.click()}>Save Metadata</button
					>
					<button
						class="col-span-2 bg-red-700 p-2 rounded-xl animation text-primary-200"
						on:click={() => (deleteDialog = true)}>Delete</button
					>
				</div>
				<h1 class="text-lg font-bold pt-3">Stats</h1>
				<Separator />
				<div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0">
					<!-- Not editable metadata -->
					{#each Object.entries(data.files[selectedIndex].stats) as [key, stat]}
						<p>{key}</p>
						<p>{stat}</p>
					{/each}
					<p>Episode Num</p>
					<p>{data.files[selectedIndex].nfo.episode}</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<Popover title="Confirm Deletion" bind:open={deleteDialog}>
	<p class="text-center">
		Are you sure you want to delete <b>{data.files[selectedIndex].nfo.title}</b>?<br />
		This action CANNOT be reverted!
	</p>
	<div class="flex justify-between pt-5">
		<button
			class="font-bold"
			on:click={() => {
				toaster.info('Deletion canceled');
				deleteDialog = false;
			}}>Cancel</button
		>
		<button
			class="text-red-600 font-bold"
			on:click={() => {
				document.getElementById('deleteButton')?.click();
				deleteDialog = false;
			}}>Delete</button
		>
	</div>
</Popover>

<Popover title="Download Video" bind:open={downloadDialogVideo}>
	<form
		method="post"
		action="?/downloadPodcastVideo"
		class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3 mb-2"
		use:enhance={(e) => {
			e.formData.set('toastId', toaster.loading('Downloading video'));
			downloadDialogVideo = false;
		}}
	>
		<p>Video ID</p>
		<input
			name="youtubemetadataid"
			placeholder="a3jhs5das"
			required
			class="animation bg-background-700"
		/>
		<button class="col-span-2 mt-3 bg-background-700 rounded-xl p-2 animation"
			>Download Episode</button
		>
	</form>
</Popover>
<Popover title="Download Playlist" bind:open={downloadDialogPlaylist}>
	<form
		method="post"
		action="?/downloadPodcastPlaylist"
		class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3 mb-2"
		use:enhance={(e) => {
			e.formData.set('toastId', toaster.loading('Downloading Playlist'));
			downloadDialogVideo = false;
		}}
	>
		<p>Playlist ID</p>
		<input
			name="playlistId"
			placeholder="playlist Id"
			required
			class="animation bg-background-700"
		/>
		<button class="col-span-2 mt-3 bg-background-700 rounded-xl p-2 animation"
			>Download Playlist</button
		>
	</form>
</Popover>
