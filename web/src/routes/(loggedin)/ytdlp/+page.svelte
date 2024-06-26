<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onlyAscii } from '$lib/frontendUtil';
	import Icon from '$lib/ui/components/Icon.svelte';
	import Popover from '$lib/ui/components/Popover.svelte';
	import Separator from '$lib/ui/components/Separator.svelte';
	import DateInput from '$lib/ui/components/DateInput.svelte';
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
		const newNFOData = data.shows[selectedIndex].nfo;

		Object.entries(newNFOData).forEach(([key, value]) => {
			if (key == 'originaltitle') return;
			e.formData.append(key, value);
		});

		e.formData.append('path', data.shows[selectedIndex].stats.location);
	};
	const remove = (e: { formData: FormData }) => {
		loadingId = toaster.loading('Deleting Show');
		e.formData.append('path', data.shows[selectedIndex].stats.location);
	};

	let deleteDialog = false;
	let createDialog = false;
</script>

<form class="hidden" method="post" action="?/editMetadata" use:enhance={save}>
	<button id="saveButton"></button>
</form>

<div class="flex gap-x-2 content-stretch md:flex-row flex-col">
	<div class="grid grid-cols-[auto_1fr] h-min">
		{#each data.shows as file, i}
			<div class="w-[24px]"></div>
			<button
				class:underline={selectedIndex == i}
				class="block text-left"
				on:click={() => (selectedIndex = i)}
				on:dblclick={() => goto(`ytdlp/${data.shows[i].stats.location}`)}
			>
				{file.nfo.title}
			</button>
		{/each}
		<Icon code="playlist_add" class="!text-text-200" />
		<button class="block text-left" on:click={() => (createDialog = true)}>Create</button>
	</div>
	{#if data.shows.length != 0}
		<div>
			<div class="sticky top-0">
				<h1 class="text-lg font-bold">Metadata</h1>
				<Separator />
				<div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-3">
					<p>Title</p>
					<input
						placeholder="title"
						bind:value={data.shows[selectedIndex].nfo.title}
						class="animation"
						on:keypress={onlyAscii}
					/>
					<p>Description</p>
					<textarea
						placeholder="description"
						class="animation"
						bind:value={data.shows[selectedIndex].nfo.plot}
						on:keypress={onlyAscii}
					/>
					<p>Studio</p>
					<input
						placeholder="studio"
						bind:value={data.shows[selectedIndex].nfo.studio}
						class="animation"
						on:keypress={onlyAscii}
					/>
					<p>Released</p>
					<DateInput
						bind:value={data.shows[selectedIndex].nfo.releasedate}
						class="animation bg-background-800"
					/>
					<p>Added</p>
					<DateInput
						bind:value={data.shows[selectedIndex].nfo.dateadded}
						class="animation bg-background-800"
					/>

					<p>Channel ID</p>
					<input
						bind:value={data.shows[selectedIndex].nfo.youtubemetadataid}
						placeholder="Youtube Channel Id"
						class="animation"
						on:keypress={onlyAscii}
					/>
					<p>Trailer ID</p>
					<input
						bind:value={data.shows[selectedIndex].nfo.trailer}
						placeholder="trailer youtube id"
						class="animation"
						on:keypress={onlyAscii}
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
					{#each Object.entries(data.shows[selectedIndex].stats) as [key, stat]}
						<p>{key}</p>
						<p>{stat}</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<form class="hidden" method="post" action="?/deleteShow" use:enhance={remove}>
	<button id="deleteButton"></button>
</form>
<Popover title="Confirm Deletion" bind:open={deleteDialog}>
	<p class="text-center">
		Are you sure you want to delete <b>{data.shows[selectedIndex].nfo.title}</b>?<br />
		This action CANNOT be reverted and will delete ALL seasons AND ALL Episodes!
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

<Popover title="Create Show" bind:open={createDialog}>
	<form
		method="post"
		action="?/createChannel"
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
			loadingId = toaster.loading('Creating channel');
		}}
	>
		<p>Name</p>
		<input
			placeholder="Name"
			name="title"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<p>Description</p>
		<textarea
			placeholder="Description"
			name="plot"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<p>Release</p>
		<DateInput name="releasedate" class="animation bg-background-700" />
		<p>Channel ID</p>
		<input
			placeholder="YOutube Channel Id"
			name="youtubemetadataid"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<p>Studio</p>
		<input
			placeholder="Studio"
			name="studio"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<p>Trailer</p>
		<input
			placeholder="Trailer youtube Id"
			name="trailer"
			class="animation bg-background-700"
			on:keypress={onlyAscii}
		/>
		<button class="animation bg-primary-700 p-2 rounded-xl col-span-2">Create</button>
	</form>
</Popover>
