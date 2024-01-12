<script lang="ts">
	import './global.css';
	import { toast } from './toast';
	import Toast from '../elements/Toast.svelte';
</script>

<div id="toasts">
	{#each $toast as toast}
		<Toast t={toast} />
	{/each}
</div>

<header>
	<div class="inner">
		<div class="logo">
			AutoDl
			<div>l</div>
			<div>l</div>
			<div>l</div>
		</div>
		<a data-s href="/home">Home</a>
		<a data-s href="/channel">Channels</a>
		<a data-s href="/waitlist">Waitlist</a>
		<a data-s href="/logs">Logs</a>
	</div>
</header>

<div id="content">
	<slot />
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fugaz+One&display=swap');
	.logo {
		color: var(--bg);
		background-color: var(--t);
		padding-right: 8px;
		padding-left: 5px;
		border-radius: 5px;
		font-weight: 1000;
		letter-spacing: -2px;
		font-family: 'Fugaz One', sans-serif;
		user-select: none;
		font-size: x-large;
		text-shadow: none;
		transition: 100ms ease;
	}
	.logo > div {
		display: inline;
		font-family: 'Fugaz One', sans-serif;
	}
	.logo > div:nth-child(1) {
		font-size: 1.3rem;
		opacity: 0.7;
	}
	.logo > div:nth-child(2) {
		font-size: 1rem;
		opacity: 0.5;
	}
	.logo > div:nth-child(3) {
		font-size: 0.7rem;
		opacity: 0.3;
	}
    @media screen and (max-width: 400px) {
        .logo > div {
            display: none;
        }
    }
    @media screen and (max-width: 300px) {
        .logo {
            display: none;
        }
    }  
	#toasts {
		width: fit-content;
		position: fixed;
		top: 0;
		right: 0;
		width: fit-content;
		z-index: 9999;
	}

	#content {
		max-width: 1000px;
		margin: auto;
		margin-top: 70px;
	}
	.inner {
		max-width: 1000px;
		z-index: 9998;
		padding: 10px;
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		margin: auto;
	}
	header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}
	a {
		user-select: none;
		text-decoration: none;
		font-weight: 700;
		color: var(--t);
	}
</style>
