<script lang="ts">
	import { formatDuration, formatSize } from '$lib/helper.js';

	export let data;
</script>

<div class="center-container">
	<div class="grid">
		<div class="title" style="text-align: left;">Name</div>
		<abbr title="Episodes" class="title">E</abbr>
		<abbr title="Seasons" class="title">S</abbr>
		<div class="title">Time</div>
		<div class="title">Size</div>

		<a href="/channels/add">{'< new >'}</a>
		<div />
		<div />
		<div />
		<div />

		{#each data.data as channel}
			<a href="/channels/{channel.id}">{channel.name}</a>
			<code>{channel.videos}</code>
			<code>{channel.seasons}</code>
			<code>{formatDuration(channel.length)}</code>
			<code>{formatSize(channel.size)}</code>
		{/each}
	</div>
</div>

<style lang="scss">
	.center-container {
		padding-top: 70px;
		justify-content: start;
		height: fit-content;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr auto auto auto auto;
		row-gap: 5px;
		column-gap: 10px;
		& > div,
		& > abbr {
			text-align: center;
		}
	}
	.title {
		padding-bottom: 20px;
	}
</style>
