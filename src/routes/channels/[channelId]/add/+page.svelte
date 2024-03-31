<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	export let data;
	export let form;
</script>

<button
	data-text
	on:click={() => {
		goto('/channels/' + data.id);
	}}>Go back</button
>
<div class="center-container">
	<h3>Add a Season</h3>
	<form method="post">
		<div class="values-list" style="align-items: center;">
			<div>Name</div>
			<input type="text" name="name" />
			<abbr title="javascript regex">regex</abbr>
			<input type="text" name="regex" />
			<div>Description</div>
			<input type="text" maxlength="30" name="description" />
		</div>
		<input type="submit" style="width: 100%;" value="Create" />
	</form>
	{#if form}
		<div>
			{form.text}
		</div>
	{/if}
</div>
