<script lang="ts">
	import { formatDuration, formatSize } from '$lib/helper';

	export let data;

	function update() {
		(document.getElementById('edit') as HTMLFormElement).submit();
	}
</script>

<div class="center-container" style="justify-content: start; padding-top: 70px">
	<form method="post" id="edit" action="?/edit">
		<h3>
			<input
				on:keyup={(e) => (e.key == 'Enter' ? update() : null)}
				data-hidden
				value={data.name}
				type="text"
				style="font-size: 2.369rem; text-align:center"
				name="name"
				placeholder="name"
			/>
		</h3>
		<p>
			<input
				on:keyup={(e) => (e.key == 'Enter' ? update() : null)}
				data-hidden
				value={data.description}
				type="text"
				style="width: 100%; text-align:center"
				maxlength="30"
				placeholder="description"
				name="description"
			/>
		</p>
		<div class="center">
			<h3>Stats</h3>
			<div class="values-list" style="grid-template-columns: auto auto 50px auto auto;">
				<div>Videos</div>
				<code>{data.seasons.map((season) => season.videos).reduce((p, c) => p + c)}</code>
				<div />
				<div>Seasons</div>
				<code>{data.seasons.length}</code>
				<div>Size</div>
				<code
					>{formatSize(data.seasons.map((season) => season.size).reduce((p, c) => p + c, 0))}</code
				>
				<div />
				<div>Time</div>
				<code
					>{formatDuration(
						data.seasons.map((season) => season.length).reduce((p, c) => p + c, 0)
					)}</code
				>
			</div>
			<br />
			<div>
				Downloading: &ThickSpace;
				<input type="checkbox" checked={data.downloading} on:input={update} name="auto" />
			</div>

			<br /><br />
			<h3>Seasons</h3>
			<div class="values-list seasons" style="grid-template-columns: 1fr auto auto auto;">
				<div style="text-align: left;">Name</div>
				<abbr title="Episodes">E</abbr>
				<div>Time</div>
				<div>Size</div>
				<a href="/channels/{data.id}/add">{'< new >'}</a>
				<code></code>
				<code></code>
				<code></code>
				{#each data.seasons as season}
					<a href="/channels/{data.id}/{season.id}">{season.name}</a>
					<code>{season.videos}</code>
					<code>{formatDuration(season.length)}</code>
					<code>{formatSize(season.size)}</code>
				{/each}
			</div>
		</div>
	</form>
	<br />
	<br />
	<br />
	<form method="post" action="?/delete">
		<button data-red>
			⚠️ DELETE THIS CHANNEL ⚠️<br />
			ALL VIDEOS AND SEASONS<br />
			WILL BE DELETED
		</button>
	</form>
</div>

<style lang="scss">
	h3,
	p {
		text-align: center;
	}
	p {
		padding-bottom: 20px;
	}
	.values-list {
		width: fit-content;
	}
	.center {
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		& > .seasons {
			div {
				text-align: center;
			}
		}
	}
</style>
