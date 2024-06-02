<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/ui/components/Icon.svelte';
	import { toaster } from '$lib/ui/toast/toaster';

	export let id: string;
	export let title: string;
	export let detail: string;
	export let progress: number;
	export let process: 'yt' | 'spot' | 'audio' | 'system';
	export let done: boolean;
</script>

<div class="p-4 bg-background-800 rounded-xl">
	<h1 class="text-lg flex justify-between items-center">
		<p
			class={process == 'audio'
				? '!text-secondary-400'
				: process == 'spot'
					? '!text-accent-500'
					: process == 'yt'
						? '!text-primary-400'
						: '!text-blue-100'}
		>
			{title}
		</p>
		<div>
			{#if done}
				<form
					method="post"
					action="?/deleteTask"
					use:enhance={(e) => {
						e.formData.set('id', id);
						e.formData.set('toastId', toaster.loading('Deleting Task'));
					}}
				>
					<button>
						<Icon
							code="delete"
							info="Remove Process Entry"
							class={process == 'audio'
								? '!text-secondary-400'
								: process == 'spot'
									? ''
									: process == 'yt'
										? '!text-primary-400'
										: '!text-blue-100'}
						/>
					</button>
				</form>
			{/if}
		</div>
	</h1>
	{#if !done}
		<div class="h-4 bg-background-700 rounded-full overflow-hidden">
			<div
				style="width: {progress * 100}%; transition: width 200ms ease-out"
				class="h-[100%] bar"
				class:done
				class:yt={process == 'yt'}
				class:spot={process == 'spot'}
				class:audio={process == 'audio'}
			/>
		</div>
	{/if}
	<p
		class="text-text-500 text-xs overflow-ellipsis overflow-x-hidden whitespace-nowrap"
		title={detail}
	>
		{detail}
	</p>
</div>

<style>
	.bar {
		--c1: theme('colors.background.400');
		--c2: theme('colors.background.500');
		background-color: var(--c1);
		background-image: linear-gradient(
			110deg,
			transparent calc(25% - 1px),
			var(--c2) calc(25% + 1px),
			var(--c2) calc(70% - 1px),
			transparent calc(70% + 1px),
			transparent
		);
		background-size: 2rem 1rem;
		background-position-x: 0;
		animation: slide 5s linear infinite;
		&.done {
			animation: none;
		}
		&.yt {
			--c1: theme('colors.primary.400');
			--c2: theme('colors.primary.500');
		}
		&.spot {
			--c1: theme('colors.accent.600');
			--c2: theme('colors.accent.700');
		}
		&.audio {
			--c1: theme('colors.secondary.400');
			--c2: theme('colors.secondary.500');
		}
	}
	@keyframes slide {
		from {
			background-position-x: 0;
		}
		to {
			background-position: 2rem;
		}
	}
</style>
