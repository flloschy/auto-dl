<script lang="ts">
	export let form;
</script>

<div class="center-container">
	<form method="post">
		<div class="err shadow" class:show={!!form}>username or password incorrect</div>
		<input name="username" placeholder="username" type="text" />
		<input name="password" placeholder="password" type="password" />
		<input type="submit" />
	</form>
</div>

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		// background-color: rgba(0, 0, 0, 0.25);
		padding: 20px;
		border-radius: 10px;

		box-shadow:
			5px 5px 10px rgba(0, 0, 0, 0.7) inset,
			-5px -5px 10px rgba(255, 255, 255, 0.1) inset;
	}
	.err {
		background-color: red;
		display: none;
	}
	.show {
		display: block;
	}
</style>
