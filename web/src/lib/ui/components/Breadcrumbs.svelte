<script lang="ts">
	import { page } from '$app/stores';

	let crumbs: { name: string; path: string }[] = [];
	page.subscribe((p) => {
		crumbs = p.url.pathname
			.split('/')
			.slice(1)
			.map((v, i, a) => ({
				name: v,
				path: a.filter((_, i2) => i2 <= i).join('/')
			}));
	});
</script>

<div class="flex gap-x-2 text-lg font-bold overflow-x-scroll whitespace-nowrap">
	<!-- <p>/</p>
    <a href="/">root</a> -->
	{#each crumbs as crumb, i}
		{#if i != crumbs.length}
			<p>/</p>
		{/if}
		<a href="/{crumb.path}">{crumb.name}</a>
	{/each}
</div>
