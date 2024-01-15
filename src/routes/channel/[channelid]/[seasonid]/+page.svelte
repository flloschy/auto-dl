<script lang="ts">
	import type { Episode } from '$lib/data/interfaces';
	import { formatDuration, formatSize } from '$lib/helper';
	import Modal from '../../../../elements/Modal.svelte';

	export let data;
	let deleteModal = false;
	let deleteConfirmModal = false;
	let previewData: Episode;
	let previewModal = false;

	let deleteVideoModal = false;
	let deleteVideoConfirmModal = false;
</script>

<svelte:head>
	<title>AutoDl - {data.name}</title>
</svelte:head>

<Modal bind:open={previewModal}>
	{#if previewData}
		<h2 style="text-align: center;">
			Episode {previewData.episodeId} - {previewData.name}
		</h2>
		<div style="display: block; width: 100%;">
			<div
				class="width: 100%;"
				style="display: flex; justify-content: center"
			>
				<iframe
					style="justify-self: center;"
					width="560"
					height="315"
					src="https://www.youtube-nocookie.com/embed/{previewData.videoId}"
					title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				></iframe>
			</div>
		</div>
		<div
			style="margin-top:20px; 100%; display: flex; justify-content: center;"
		>
			<button data-p on:click={() => (deleteVideoModal = true)}
				>Delete</button
			>
		</div>
        <form method="post" action="?/swap" class="gridoverwrite">
            <input hidden value="{previewData.videoId}" name="from">
            Swap with<select name="to">
                {#each Object.values(data.episodes) as episode}
                    {#if episode.episodeId != previewData.episodeId}
                        <option value={episode.videoId}>{episode.episodeId} - {episode.name}</option>
                    {:else}
                        <option value={episode.videoId} disabled>{episode.episodeId} - {episode.name}</option>
                    {/if}
                {/each}
            </select><button disabled={Object.values(data.episodes).length == 1}>Swap</button>
        </form>
	{/if}
</Modal>

<Modal bind:open={deleteVideoModal}>
	{#if previewData}
		<h1>
			Do you really want to Delete <strong data-s
				>Episode {previewData.episodeId} - {previewData.name}</strong
			>?
		</h1>
		<div class="confirmGrid">
			<button data-s on:click={() => (deleteVideoModal = false)}
				>No</button
			>
			<button data-p on:click={() => (deleteVideoConfirmModal = true)}
				>Yes</button
			>
		</div>
	{/if}
</Modal>
<Modal bind:open={deleteVideoConfirmModal}>
	{#if previewData}
		<h1>
			This is your <strong>last</strong> chance to nope out and
			<strong data-s>NOT</strong>
			delete
			<strong>Episode {previewData.episodeId} - {previewData.name}</strong
			>!!!<br />Do you want to delete Episode {previewData.episodeId} - {previewData.name}?
		</h1>
		<div class="confirmGrid">
			<button
				data-s
				on:click={() => {
					deleteVideoModal = false;
					deleteVideoConfirmModal = false;
				}}>No</button
			>
			<form method="post" action="?/remove">
				<input
					type="text"
					name="id"
					hidden={true}
					value={previewData.episodeId}
				/>
				<button
					data-p
					on:click={() => {
						deleteVideoModal = false;
						deleteVideoConfirmModal = false;
					}}>Yes</button
				>
			</form>
		</div>
	{/if}
</Modal>

<Modal bind:open={deleteModal}>
	<h1>Do you really want to Delete <strong data-s>{data.name}</strong>?</h1>
	<div class="confirmGrid">
		<button data-s on:click={() => (deleteModal = false)}>No</button>
		<button data-p on:click={() => (deleteConfirmModal = true)}>Yes</button>
	</div>
</Modal>
<Modal bind:open={deleteConfirmModal}>
	<h1>
		This is your <strong>last</strong> chance to nope out and
		<strong data-s>NOT</strong>
		delete
		<strong>{data.name}</strong>!!!<br />Do you want to delete {data.name}?
	</h1>
	<div class="confirmGrid">
		<button
			data-s
			on:click={() => {
				deleteModal = false;
				deleteConfirmModal = false;
			}}>No</button
		>
		<form method="post" action="?/delete">
			<button
				data-p
				on:click={() => {
					deleteModal = false;
					deleteConfirmModal = false;
				}}>Yes</button
			>
		</form>
	</div>
</Modal>

<form method="post" action="?/update" class="update">
	<h2>Season</h2>
	<div />
	<div>Id</div>
	<div>{data.seasonid}</div>
	<div>Name</div>
	<input
		value={data.name}
		name="name"
		placeholder="Name"
		on:keydown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
	/>
	<div>Description</div>
	<textarea name="description" placeholder="Description" rows="5"
		>{data.description}</textarea
	>
	<div>Regex</div>
	<input name="regex" value={data.regex} placeholder="regex" />
	<div>Watch length</div>
	<div>
		{formatDuration(
			Object.values(data.episodes)
				.map((e) => e.length)
				.reduce((p, c) => p + c, 0),
		)}
	</div>
	<div>Storage</div>
	<div>
		{formatSize(
			Object.values(data.episodes)
				.map((e) => e.size)
				.reduce((p, c) => p + c, 0),
		)}
	</div>
	<div>Updated</div>
	<div>{formatDuration(data.updated, true)}</div>
	<button
		disabled={!data.deletable}
		style="width:100%"
		data-p
		on:click|preventDefault={() => (deleteModal = true)}>Delete</button
	>
	<button>Update</button>
</form>

<div class="seasons">
	<h2>Episodes</h2>

	<div class="grid">
		<div class="header center number">#</div>
		<div class="header name">Name</div>
		<div class="header right length">Length</div>
		<div class="header right size">Size</div>
		<div class="header right date">Date</div>
		{#each Object.values(data.episodes) as episode, i}
			<div class="data number">{i + 1}.</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				class="textoverflow name"
				data-p
				on:click={() => {
					previewModal = true;
					previewData = episode;
				}}>{episode.name}</a
			>
			<div class="length">{formatDuration(episode.length)}</div>
			<div class="size date">{formatSize(episode.size)}</div>
			<div>{formatDuration(episode.downloadDate, true, true)} ago</div>
		{/each}
	</div>
</div>

<style>  

    .gridoverwrite {
        display: grid;
        grid-template-columns: auto auto auto;
        width: min-content;
        margin-top: 20px;
    }

	.center {
		justify-self: center;
	}
	.right {
		justify-self: right;
	}

	.data {
		user-select: none;
		opacity: 0.7;
	}
	.header {
		font-size: 0.8rem;
		font-style: italic;
		align-self: self-end;
		user-select: none;
		opacity: 0.7;
	}
	.grid {
		display: grid;
		grid-template-columns: auto 1fr auto auto auto;
		gap: 10px;
	}
	.seasons > h2 {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}

	.seasons {
		width: 50%;
		margin: auto;
		margin-top: 50px;
	}

	.confirmGrid {
		display: grid;
		grid-template-columns: 4fr 1fr;
	}
	.confirmGrid > form {
		display: block;
		width: 100%;
	}
	.confirmGrid > form > button {
		width: 100%;
	}

	form {
		display: grid;
		grid-template-columns: auto 1fr;
		width: 50%;
		margin: auto;
		gap: 5px 10px;
	}
    
    @media screen and (max-width: 600px) {
        .seasons, .update {
            width: 100%;
        }
    }
    @media screen and (max-width: 400px) {
        .size {
            width: 0;
            height: 0;
            overflow: hidden;
        }
    }
    @media screen and (max-width: 300px) {
        .length {
            width: 0;
            height: 0;
            overflow: hidden;
        }
    }
    @media screen and (max-width: 250px) {
        .date {
            width: 0;
            height: 0;
            overflow: hidden;
        }
    }
    @media screen and (max-width: 200px) {
        .number {
            width: 0;
            height: 0;
            overflow: hidden;
        }
    }
</style>
