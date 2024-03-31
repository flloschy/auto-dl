<script lang="ts">
	import { page } from '$app/stores';
	import '../uilib/style.scss';
</script>

<svelte:head>
	<title>AutoDl</title>
</svelte:head>

{#if $page.route.id == '/login' || $page.error}
	<slot />
{:else}
	<header>
		<a href="/dashboard">AutoDl</a>
		<a href="/channels">Channels</a>
		<a href="/waitlist">Waitlist</a>
		<a href="/logs">Logs</a>
		<a href="/login">Logout</a>
	</header>
	<main>
		<slot />
	</main>
{/if}

<style>
	header {
		display: flex;
		justify-content: space-between;
	}
	main {
		height: 100%;
	}
</style>
