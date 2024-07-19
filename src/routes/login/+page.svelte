<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="post" use:enhance>
	<input placeholder="password" name="password" type="password" />
	<input placeholder="password" type="submit" style="margin-top: 1.2rem;" />
</form>

<style>
	input {
		padding: 1em;
		outline: none;
		border: none;
		background-color: var(--primary);
		color: var(--background);
		border-radius: 1em;
		transition: all 150ms 250ms ease-out;
		width: 100%;
	}
	input::placeholder {
		color: var(--secondary);
	}
	input:focus {
		transition: all 100ms ease-out;
		/* border-bottom-left-radius: 0;
        border-bottom-right-radius: 0; */
		background-color: var(--accent);
	}
</style>
