<script lang="ts">
	import Actions from './Actions.svelte';
	import Tasks from './Tasks.svelte';
	export let data;
</script>

<div class="flex flex-col flex-wrap gap-x-10 mb-3">
	<h1 class="text-xl">IP</h1>
	<div class="grid grid-cols-[auto_1fr] gap-x-3">
		<p>Server</p>
		<p>{data.server}</p>
		<p>You</p>
		<p>{data.your}</p>
	</div>
</div>
<Tasks />
<Actions />
