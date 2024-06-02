<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/ui/components/Icon.svelte';
	import { toaster } from '$lib/ui/toast/toaster';

	const actions: {
		[key: string]: {
			icon: string;
			label: string;
			action: string;
		}[];
	} = {
		System: [
			{
				icon: 'handyman',
				label: 'Create missing NFO',
				action: 'fixNFO'
			},
			{
				icon: 'restart_alt',
				label: 'Replace all NFO',
				action: 'replaceNFO'
			}
		],
		Spotify: [
			{
				icon: 'sync',
				label: 'Sync All Playlists',
				action: 'syncAll'
			}
		]
	};
</script>

<div class="flex flex-col flex-wrap gap-x-10 mt-3">
	<h1 class="text-xl">Actions</h1>
	<div class="flex gap-x-3 flex-wrap gap-y-2">
		{#each Object.entries(actions) as [key, value]}
			<div class="flex-1 min-w-[200px]">
				<h1 class="mb-1">{key}</h1>
				<div class="buttonGrid">
					{#each value as action}
						<form
							method="post"
							action="?/{action.action}"
							class="animation"
							use:enhance={(e) => {
								e.formData.set('toastId', toaster.loading(action.label));
							}}
						>
							<Icon code={action.icon} />
							<button>{action.label}</button>
						</form>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.buttonGrid {
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 5px;
		form {
			padding: 0.5rem;
			width: 100%;
			align-items: center;
			display: flex;
			column-gap: 0.4rem;
			padding-left: 1rem;
			padding-right: 1rem;
			background-color: theme('colors.background.800');
			border-radius: 100px;
			&:hover {
				background-color: theme('colors.background.700');
			}
			& > button {
				width: 100%;
			}
		}
	}
</style>
