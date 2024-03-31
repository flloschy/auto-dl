<script lang="ts">
	import { formatDuration, formatSize } from '$lib/helper';

	export let data;
</script>

<div class="center-container">
	<div>
		<form method="post" action="?/rename">
			<input
				data-hidden
				type="text"
				value={data.video.title}
				name="title"
				style="width: 100%; font-size: 2.369rem; text-align:center"
			/>
		</form>
		<div class="center-container">
			<form class="values-list" method="post" action="?/transfer">
				<div>Date</div>
				<code>{data.video.time.toLocaleDateString()}</code>
				<div>Time</div>
				<code>{data.video.time.toLocaleTimeString()}</code>
				<div>Length</div>
				<code>{formatDuration(data.video.length)}</code>
				<div>Size</div>
				<code>{formatSize(data.video.size)}</code>
				<div>ID</div>
				<code>{data.video.id}</code>
				<div>Number</div>
				<code>{data.video.num}</code>
				<select name="target">
					<option disabled>{data.video.season.name}</option>
					{#each data.seasons as season}
						{#if season.id != data.video.season.id}
							<option value={season.id}>{season.name}</option>
						{/if}
					{/each}
				</select>
				<button data-green>Transfer</button>
			</form>
			<br />
			<form method="post" action="?/delete">
				<button data-red>⚠️ DELETE THIS VIDEO ⚠️</button>
			</form>
		</div>
	</div>
</div>
