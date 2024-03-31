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
			<div class="values-list" style="grid-template-columns: auto auto 50px auto auto">
				<div>Videos</div>
				<code>{data.videos.length}</code>
				<div />
				<div>Season</div>
				<code>{data.num}</code>
				<div>Size</div>
				<code>{formatSize(data.videos.map((video) => video.size).reduce((p, c) => p + c, 0))}</code>
				<div />
				<div>Time</div>
				<code
					>{formatDuration(
						data.videos.map((video) => video.length).reduce((p, c) => p + c, 0)
					)}</code
				>
			</div>
			<br />
			Regex: &ThickSpace;
			<input
				type="text"
				data-hidden
				value={data.regex}
				on:keyup={(e) => (e.key == 'Enter' ? update() : null)}
				name="regex"
				style="text-align:center"
			/>
			<br /><br />
			<h3>Episodes</h3>
			<div class="values-list seasons" style="grid-template-columns: 1fr auto auto;">
				<div style="text-align: left;">Name</div>
				<div>Time</div>
				<div>Size</div>
				{#each data.videos as video}
					<a href="/channels/{data.id}/{data.season.id}/{video.id}">{video.title}</a>
					<code>{formatDuration(video.length)}</code>
					<code>{formatSize(video.size)}</code>
				{/each}
			</div>
		</div>
	</form>
	<br />
	<br />
	<br />
	<form method="post" action="?/delete">
		<button data-red disabled={data.num == 0}>
			{#if data.num == 0}
				[ Cant delete the default season ]
			{:else}
				⚠️ DELETE THIS SEASON ⚠️<br />
				ALL VIDEOS WILL BE DELETED
			{/if}
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
