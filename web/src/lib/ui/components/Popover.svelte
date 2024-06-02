<script lang="ts">
	import Icon from './Icon.svelte';
	import Separator from './Separator.svelte';
	import { fade, scale } from 'svelte/transition';

	export let open = false;
	export let title: string;
	let fgClicked = 0;

	const fgClick = () => {
		fgClicked = Date.now();
	};
	const bgClick = () => {
		const now = Date.now();
		if (fgClicked < now + 2 && fgClicked > now - 2) return;
		else open = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		transition:fade={{ duration: 250 }}
		class="absolute top-0 left-0 w-[100vw] h-[100vh] bg-background-800/80 z-99 backdrop-blur-sm flex justify-center place-items-center"
		on:click={bgClick}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			transition:scale={{ duration: 250, opacity: 20 }}
			class="p-5 bg-background-800 outline outline-1 outline-background-900 rounded-xl shadow-lg z-99 w-fit"
			on:click={fgClick}
		>
			<div class="flex gap-x-2 justify-between">
				<h1 class="font-bold text-accent-500">{title}</h1>
				<button on:click={() => (open = false)}>
					<Icon code="close" />
				</button>
			</div>
			<Separator />
			<div>
				<slot />
			</div>
		</div>
	</div>
{/if}
