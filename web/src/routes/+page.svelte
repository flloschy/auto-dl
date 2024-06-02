<script lang="ts">
	import Separator from '$lib/ui/components/Separator.svelte';
	import Icon from '$lib/ui/components/Icon.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	export let form;
	$: if (form != null && browser) goto('/dashboard');
</script>

<form class="w-[100%] h-[100%] flex flex-col justify-center items-center" method="post">
	<div class="w-fit flex place-items-center flex-col">
		<h1 class="flex text-lg font-bold">AutoDl</h1>
		<p class="text-xs opacity-75">Manage media for your jellyfin server!</p>
		<Separator />
		<input type="password" placeholder="password" class="text-center w-[100%]" name="password" />
	</div>
</form>

<a class="absolute top-2 right-2" href="https://github.com/flloschy/auto-dl" target="_blank">
	<Icon code="code" info="github" class="!text-secondary-500" />
</a>
