<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let open: boolean = false;
	let id = Math.round(Math.random() * 9999999);

	let showShadow = false;
	onMount(() => {
		if (browser) {
			const ro = new ResizeObserver((entries) => {
				const { target } = entries[0];
				showShadow = target.scrollHeight > target.clientHeight;
			});
			ro.observe(document.getElementById(`m${id}m`) as Element);
		}
	});
</script>

<div class="container" class:open>
	<div class="modal" id="m{id}m">
		<div class="shadowTop" class:hidden={!showShadow} />
		<slot />
		<div class="shadowBottom" class:hidden={!showShadow} />
	</div>
	<button class="closer" on:click={() => (open = false)}>&times;</button>
</div>

{#if open}
	<style>
		html {
			overflow: hidden;
			user-select: none;
			pointer-events: none;
		}
	</style>
{/if}

<style>
	.shadowTop {
		position: absolute;
		top: 40px;
		left: 40px;
		width: calc(100% - 2 * 40px);
		background: linear-gradient(180deg, black, transparent, transparent);
		height: 30px;
		border-radius: 10px;
	}
	.shadowBottom {
		position: absolute;
		bottom: 40px;
		left: 40px;
		width: calc(100% - 2 * 40px);
		background: linear-gradient(0deg, black, transparent, transparent);
		height: 30px;
		border-radius: 10px;
	}
	.hidden {
		display: none;
	}

	.closer {
		user-select: none;
		width: 17px;
		padding: 0;
		margin: 0;
		aspect-ratio: 1/1;
		position: absolute;
		top: 10px;
		right: 10px;
	}
	.closer:hover {
		transform: scale(0.8);
	}
	.closer:active {
		transform: scale(0.9);
	}

	.container {
		transition: top 500ms cubic-bezier(0.15, 1, 0, 1);
		user-select: text !important;
		pointer-events: auto !important;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		top: 0;
		left: 0;
		width: 100svw;
		height: 100svh;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		z-index: 9999;
	}
	.container:not(.open) {
		top: -105%;
		background-color: rgba(0, 0, 0, 0);
	}
	.modal {
		outline: 1.5px var(--bga) solid;
		overflow-y: scroll;
		/*                         margin   padding */
		max-height: calc(100svh - 2 * 40px - 2 * 20px);
		margin: 40px;
		background-color: var(--bg);
		padding: 20px;
		border-radius: 10px;
	}
</style>
