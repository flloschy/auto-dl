<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;
</script>

<div class="center-container">
	<h2>Waitlist</h2>
	<div class="grid">
		<button data-green on:click={() => goto('/waitlist/addVidoes')}> Add Video </button>
		<button data-green on:click={() => goto('/waitlist/addPlaylist')} style="margin-top: 5px"> Add Playlist</button>
		{#each data.videos as video}
			<form method="post">
				<input type="hidden" name="id" value={video} />
				<code>{video}</code>
				<button data-red>Remove</button>
			</form>
		{/each}
	</div>
</div>

<style>
	.grid {
		align-content: center;
		display: grid;

	}
	form {
		display: flex;
		column-gap: 20px;
		align-items: center;
		padding-bottom: 10px;
		padding-top: 10px;
	}
</style>
