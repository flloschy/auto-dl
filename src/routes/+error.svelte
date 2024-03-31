<script>
	import { page } from '$app/stores';
</script>

<button
	data-text
	on:click={() => {
		history.back();
	}}>Go back</button
>
<div class="center-container">
	<h1>{$page.status}</h1>
	<p>{$page.error?.message}</p>
</div>

<style>
	button {
		position: absolute;
	}
</style>
