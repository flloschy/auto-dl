<script>
	import { fly, slide } from 'svelte/transition';
	import Icon from '../components/Icon.svelte';
	import { toastStore, toaster } from './toaster';
</script>

<div id="toast" class="text-xs right-4 bottom-4 absolute flex flex-col-reverse w-[200px] gap-y-2">
	{#each $toastStore as toast}
		{#if !toast.remove}
			<div
				out:slide={{ axis: 'y', duration: 1000 }}
				in:fly={{ duration: 500, x: '100%', opacity: 0 }}
				class:error={toast.type == 'error'}
				class:info={toast.type == 'info'}
				class:success={toast.type == 'success'}
				class:loading={toast.type == 'loading'}
				class:out={toast.remove}
			>
				<span class="hidden" />
				{#if toast.type == 'error'}
					<Icon code="bug_report" class="inherit !text-base" />
				{:else if toast.type == 'info'}
					<Icon code="chat_info" class="inherit !text-base" />
				{:else if toast.type == 'success'}
					<Icon code="download_done" class="inherit !text-base" />
				{:else}
					<div class="spin">
						<Icon code="progress_activity" class="inherit !text-base" />
					</div>
				{/if}

				<div class="w-100% flex-1" style="word-break: break-all;">
					<h1>
						<p>
							{toast.message}
						</p>
						<button on:click={() => toaster.remove(toast.id)}>
							<Icon code="close" class="inherit !text-base" />
						</button>
					</h1>
					{#if toast.detail}
						<p>{toast.detail}</p>
					{/if}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style lang="scss">
	#toast {
		& > div {
			transition:
				background 500ms,
				color 500ms;
			h1 {
				width: 100%;
				display: flex;
				justify-content: space-between;
			}
			// @apply bg-background-900/80;
			// outline: 1px solid theme("colors.background.600");
			padding: 10px;
			border-radius: 10px;
			display: flex;
			width: 100%;
			backdrop-filter: blur(5px);
			max-height: 999px;
			overflow-y: hidden;

			@apply gap-x-2;
			&.error {
				@apply bg-red-950/80;
				outline: 1px solid theme('colors.red.600');
				color: theme('colors.red.500');
			}
			&.success {
				@apply bg-emerald-950/80;
				outline: 1px solid theme('colors.emerald.600');
				color: theme('colors.emerald.500');
			}
			&.info {
				@apply bg-cyan-950/80;
				outline: 1px solid theme('colors.cyan.600');
				color: theme('colors.cyan.500');
			}
			&.loading {
				@apply bg-gray-950/80;
				outline: 1px solid theme('colors.gray.600');
				color: theme('colors.gray.500');
			}
		}
	}
</style>
