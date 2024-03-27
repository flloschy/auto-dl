<script lang="ts">
	export let form;
</script>

<div class="center-container">
	<h3>Add a Channel</h3>
	<form method="post">
		<div class="values-list" style="align-items: center;">
			<div>Channel Id</div>
			<input type="text" name="id" />
			<abbr title="NEEDS to be the same name as found on youtube!!!">Display Name</abbr>
			<input type="text" name="name" />
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
