<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { pushToast } from '../../toast';

	onMount(() => {
		pushToast($page.error?.message as string, true);
		setTimeout(() => goto('/home'), 100);
	});
</script>
