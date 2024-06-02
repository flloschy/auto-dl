<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import '$lib/ui/base.scss';
	import Breadcrumbs from '$lib/ui/components/Breadcrumbs.svelte';
	import Icon from '$lib/ui/components/Icon.svelte';
	import Separator from '$lib/ui/components/Separator.svelte';
	import Toast from '$lib/ui/toast/Toast.svelte';
	import "./background";
</script>

<header class="flex flex-col gap-y-1 h-100vh bg-background-950 p-2 w-[200px]">
	<button on:click={() => goto('/dashboard')} class:active={$page.url.pathname == '/dashboard'}>
		<Icon
			code="team_dashboard"
			class={$page.url.pathname == '/dashboard' ? '!text-secondary-400' : ''}
		/>
		<p>Dashboard</p>
	</button>
	<button
		on:click={() => {
			goto('/ytdlp');
		}}
		class:active={$page.url.pathname.startsWith('/ytdlp')}
	>
		<Icon
			code="smart_display"
			class={$page.url.pathname == '/ytdlp' ? '!text-secondary-400' : ''}
		/>
		<p>Youtube</p>
	</button>
	<button
		on:click={() => {
			goto('/spotdl');
		}}
		class:active={$page.url.pathname.startsWith('/spotdl')}
	>
		<Icon code="headphones" class={$page.url.pathname == '/spotdl' ? '!text-secondary-400' : ''} />
		<p>Spotify</p>
	</button>
	<button
		on:click={() => {
			goto('/podcast');
		}}
		class:active={$page.url.pathname.startsWith('/podcast')}
	>
		<Icon code="podcasts" class={$page.url.pathname == '/podcast' ? '!text-secondary-400' : ''} />
		<p>Podcast</p>
	</button>
	<button
		on:click={() => {
			goto('/logout');
		}}
		class:active={$page.url.pathname.startsWith('/logout')}
		class="mt-auto"
	>
		<Icon code="logout" class={$page.url.pathname == '/logout' ? '!text-secondary-400' : ''} />
		<p>Logout</p>
	</button>
</header>

<div class="w-[100%] overflow-y-scroll p-5">
	<main class="w-[100%] max-w-[1000px] p-5">
		<Breadcrumbs />
		<Separator />
		<slot />
	</main>
</div>

<Toast />

<style lang="scss">
	header > button {
		display: flex;
		justify-items: center;
		align-items: center;
		flex-direction: row;
		column-gap: 0.5rem;
		padding: 0.6rem;
		border-radius: 100px;
		padding-left: 0.8rem;
		&:hover {
			transition: color 200ms ease-out;
			color: theme('colors.accent.500');
			background-color: theme('colors.primary.800');
		}
		&.active {
			color: theme('colors.secondary.100');
			background-color: theme('colors.secondary.800');
		}
	}
	@media screen and (max-width: 500px) {
		header {
			width: 100%;
			overflow-x: scroll;
			display: flex;
			justify-items: center;
			align-items: center;
			flex-direction: row;
			overflow-y: hidden;
			padding-top: 1.4rem;
			padding-bottom: 1.4rem;
		}
	}
</style>
