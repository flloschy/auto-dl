<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDuration, formatSize } from '$lib/helper';
	import { onMount } from 'svelte';
	import Modal from '../../../elements/Modal.svelte';
	import { pushToast } from '../../toast';

	export let data;
	export let form;

	function u() {
		pushToast('Season Created', false);
		goto(`/channel/${data.channelId}/${form}`);
	}

	onMount(() => {
		form ? u() : null;
	});

	let deleteModal = false;
	let deleteConfirmModal = false;
	let newSeasonModal = false;
</script>

<svelte:head>
	<title>AutoDl - {data.name}</title>
</svelte:head>

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
<Modal bind:open={newSeasonModal}>
	<h1>New Season</h1>
	<form method="post" action="?/new" class="update popup" style="width: 100%;">
		<div>Name</div>
		<input
			name="name"
			placeholder="Name"
			on:keydown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
		/>
		<div>Description</div>
		<textarea name="description" placeholder="Description" rows="5"
		></textarea>
		<div>Regex</div>
		<input
			name="regex"
			placeholder="regex"
			on:keydown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
		/>
		<div />
		<div style="height: 10px;" />
		<button
			style="width: 100%;"
			data-p
			on:click|preventDefault={() => (newSeasonModal = false)}
			>Aboard</button
		>
		<button data-s class="create">Create</button>
	</form>
</Modal>

<form method="post" action="?/update" class="update">
	<h2>Channel</h2>
	<div />
	<div >Id</div>
	<div class="id">{data.channelId}</div>
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
	<div>AutoDl</div>
	<input name="auto" type="checkbox" checked={data.automaticDownloading} />
	<div>Audio Only&trade;</div>
	<input name="audio" type="checkbox" checked={data.audioOnly} />
	<div>Episodes</div>
	<div>
		{Object.values(data.seasons)
			.map((season) => season.episodes)
			.map((episodes) => Object.values(episodes).length)
			.reduce((previous, current) => previous + current, 0)}
	</div>
	<div>Watch length</div>
	<div>
		{formatDuration(
			Object.values(data.seasons)
				.map((season) => season.episodes)
				.map((episodes) =>
					Object.values(episodes)
						.map((episode) => episode.length)
						.reduce((previous, current) => previous + current, 0),
				)
				.reduce((previous, current) => previous + current, 0),
			false,
			true,
		)}
	</div>
	<div>Storage</div>
	{formatSize(
		Object.values(data.seasons)
			.map((season) => season.episodes)
			.map((episodes) =>
				Object.values(episodes)
					.map((episode) => episode.size)
					.reduce((previous, current) => previous + current, 0),
			)
			.reduce((previous, current) => previous + current, 0),
	)}

	<button
		style="width:100%"
		data-p
		on:click|preventDefault={() => (deleteModal = true)}>Delete</button
	>
	<button>Update</button>
</form>

<div class="seasons">
	<h2>
		Seasons<button on:click={() => (newSeasonModal = true)}
			>add Season</button
		>
	</h2>

	<div class="grid">
		<div class="header number">#</div>
		<div class="header name">Name</div>
		<div class="header episodes">Episodes</div>
		<div class="header updated">Updated</div>
		{#each Object.values(data.seasons) as season, i}
			<div class="data number">{i + 1}.</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<abbr class="name"
				on:click={() =>
					goto(`/channel/${data.channelId}/${season.seasonId}`)}
				title={season.description}>{season.name}</abbr
			>
			<div class="episodes">{Object.keys(season.episodes).length}</div>
			<div class="updated">{formatDuration(season.updated, true)}</div>
		{/each}
	</div>
</div>

<style>
	.data {
		user-select: none;
		opacity: 0.7;
	}
	abbr {
		cursor: pointer;
		width: fit-content;
	}
	.header {
		font-size: 0.8rem;
		font-style: italic;
		align-self: self-end;
		user-select: none;
		opacity: 0.7;
	}
	.confirmGrid {
		display: grid;
		grid-template-columns: 4fr 1fr;
	}
	.confirmGrid > form {
		width: 100%;
	}
	.confirmGrid > form button {
		width: 100%;
	}
	.grid {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
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

	.update {
		display: grid;
		grid-template-columns: auto 1fr;
		justify-items: start;
		gap: 5px 10px;
		width: 50%;
		margin: auto;
	}
    
    @media screen and (max-width: 600px) {
        .update {
            width: 100%;
        }
        .seasons {
            width: 100%;
        }
    }
    @media screen and (max-width: 350px) {
        .episodes {
            overflow: hidden;
            width: 0;
            height: 0;
        }
        .popup {
            display: grid;
		    grid-template-columns: 1fr;
        }
        .create {
            width: 100%;
        }
    } 
    @media screen and (max-width: 270px) {
        .updated {
            overflow: hidden;
            width: 0;
            height: 0;
        }
    }
    @media screen and (max-width: 250px) {
        .number {
            overflow: hidden;
            width: 0;
            height: 0;
        }
    } 
    
    .id {
        text-overflow: ellipsis;
        overflow: hidden;
        width: 100%;
    }
    
	input,
	textarea {
		width: 100%;
	}
	input[type='checkbox'] {
		width: fit-content;
	}
</style>
