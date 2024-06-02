<script lang="ts">
	export let value: boolean;
	export let name: string = '';
</script>

<div class="flex items-center">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="h-[1em] w-[1.8em] relative bg-background-700 rounded-full flex justify-center items-center"
		on:click={() => (value = !value)}
	>
		<input {name} type="checkbox" checked={value} class="hidden" />
		<div
			class="h-[70%] aspect-square rounded-full {value
				? 'bg-accent-500'
				: 'bg-secondary-500'} {value ? 'translate-x-[50%]' : 'translate-x-[-50%]'}"
			style="transition: transform 100ms cubic-bezier(0.53, 1.07, 0.93, 1.23);"
		/>
	</div>
</div>
