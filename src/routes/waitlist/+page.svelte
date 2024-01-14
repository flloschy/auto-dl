<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Modal from '../../elements/Modal.svelte';
	import { pushToast } from '../toast.js';

	export let data;
	export let form;

	const reload = () => goto('/home').then(() => goto('/waitlist'));

	const removeFromWaitlist = async (msg: string) => {
		await fetch('/api/waitlist/remove', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: msg.toString(),
		});
		pushToast('Successfully removed', false);
		reload();
	};
	onMount(() => {
		form
			? form.success
				? reload()
				: pushToast('Invalid URL', true)
			: null;
	});

	let downloadVideoModal = false;
</script>

<svelte:head>
	<title>AutoDl - Editing Waitlist</title>
</svelte:head>

<Modal bind:open={downloadVideoModal}>
	<h2>Add a video to the waitlist</h2>
	<form class="modalGrid" method="post">
		<input name="url" placeholder="Video URL" />
		<button on:click={() => (downloadVideoModal = false)}>Submit</button>
	</form>
</Modal>

<div class="grid">
	<div class="number">0.</div>
	<div class="link">Add a new Video</div>
	<button data-s on:click={() => (downloadVideoModal = true)}>Add</button>

	{#each data.lines.splice(0, data.lines.length - 1) as v, i}
		<div class="number" class:accent={i % 2 == 0}>{i + 1}.</div>
		<div class="link" class:accent={i % 2 == 0}>{v}</div>
		<button data-p on:click={async () => removeFromWaitlist(v)}
			>Remove</button
		>
	{/each}
</div>

<style>
    
    .modalGrid {
        display: grid;
        grid-template-columns: 1fr auto;
    }
    
    @media screen and (max-width: 450px) {
        .modalGrid {
        grid-template-columns: 1fr;
    }
    }
    
	.grid > button {
		cursor: pointer;
		height: 100%;
		padding: 0;
		padding-right: 3px;
		padding-left: 3px;
		margin: 0;
		border-radius: 0;
	}
	.number {
		padding-left: 6px;
		padding-right: 6px;
		user-select: none;
	}
	.accent {
		background-color: rgba(255, 255, 255, 0.2) !important;
	}
	.grid {
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
		overflow: hidden;
		width: fit-content;
		margin: auto;
		display: grid;
		grid-template-columns: auto 1fr auto;
		border-radius: 10px 0 0 10px;
	}
	.grid > div {
		background-color: rgba(255, 255, 255, 0.1);
	}
	.link {
		padding-right: 6px;
		user-select: all;
	}
</style>
