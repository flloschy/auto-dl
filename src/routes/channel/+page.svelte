<script lang="ts">
	import { formatDuration, formatSize } from '$lib/helper.js';

	export let data;
</script>

<svelte:head>
	<title>AutoDl - List of channels</title>
</svelte:head>

<div class="grid">
	<div class="number">#</div>
	<div class="name" style="justify-self: left;">Name</div>
	<div class="episodes">E</div>
	<div class="seasons">S</div>
	<div class="time">Time</div>
	<div class="disk">Disk</div>

	<div class="number" style="height: 20px;"></div>
	<div class="name"></div>
	<div class="episodes"></div>
	<div class="seasons"></div>
	<div class="time"></div>
	<div class="disk"></div>

	<div class="number">1.</div>
	<a  class="name"data-p href="/channel/new">New</a>
	<div class="episodes"></div>
	<div class="seasons"></div>
	<div class="time"></div>
	<div class="disk"></div>

	<div class="number" style="height: 5px;"></div>
	<div class="name"></div>
	<div class="episodes"></div>
	<div class="seasons"></div>
	<div class="time"></div>
	<div class="disk"></div>

	{#each Object.values(data) as channel, i}
		<div class="number">{i + 2}.</div>
		<a class="textoverflow name" data-p href="/channel/{channel.channelId}"
			>{channel.name}</a
		>
		<div class="episodes">
			{Object.values(channel.seasons)
				.map((season) => Object.values(season.episodes).length)
				.reduce((previous, current) => previous + current, 0)}
		</div>
		<div class="seasons">{Object.values(channel.seasons).length}</div>
		<div class="time">
			{formatDuration(
				Object.values(channel.seasons)
					.map((season) => season.episodes)
					.map((episodes) =>
						Object.values(episodes)
							.map((episode) => episode.length)
							.reduce(
								(previous, current) => previous + current,
								0,
							),
					)
					.reduce((previous, current) => previous + current, 0),
				false,
				true,
			)}
		</div>
		<div class="disk">
			{formatSize(
				Object.values(channel.seasons)
					.map((season) => season.episodes)
					.map((episodes) =>
						Object.values(episodes)
							.map((episode) => episode.size)
							.reduce(
								(previous, current) => previous + current,
								0,
							),
					)
					.reduce((previous, current) => previous + current, 0),
			)}
		</div>
	{/each}
	<div class="number" style="height: 20px;"></div>
	<div class="name"></div>
	<div class="episodes"></div>
	<div class="seasons"></div>
	<div class="time"></div>
	<div class="disk"></div>
	<div class="number">&sum;</div>
	<div class="name" style="justify-self: left;">Total</div>
	<div class="episodes">
		{Object.values(data)
			.map((channel) =>
				Object.values(channel.seasons)
					.map((season) => Object.values(season.episodes).length)
					.reduce((previous, current) => previous + current, 0),
			)
			.reduce((previous, current) => previous + current, 0)}
	</div>
	<div class="seasons">
		{Object.values(data)
			.map((channel) => Object.values(channel.seasons).length)
			.reduce((previous, current) => previous + current, 0)}
	</div>
	<div class="time">
		{formatDuration(
			Object.values(data)
				.map((channel) =>
					Object.values(channel.seasons)
						.map((season) => season.episodes)
						.map((episodes) =>
							Object.values(episodes)
								.map((episode) => episode.length)
								.reduce(
									(previous, current) => previous + current,
									0,
								),
						)
						.reduce((previous, current) => previous + current, 0),
				)
				.reduce((previous, current) => previous + current, 0),
			false,
			true,
		)}
	</div>
	<div class="disk">
		{formatSize(
			Object.values(data)
				.map((channel) =>
					Object.values(channel.seasons)
						.map((season) => season.episodes)
						.map((episodes) =>
							Object.values(episodes)
								.map((episode) => episode.size)
								.reduce(
									(previous, current) => previous + current,
									0,
								),
						)
						.reduce((previous, current) => previous + current, 0),
				)
				.reduce((previous, current) => previous + current, 0),
		)}
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: auto 1fr auto auto auto auto;
		width: 50%;
		margin: auto;
		gap: 0 10px;
	}
	.grid > div {
		opacity: 0.8;
		user-select: none;
	}
	a {
		justify-self: left;
		width: 100%;
	}
	div {
		justify-self: right;
	}
    
    @media screen and (max-width: 600px) {
        .episodes {
            overflow: hidden;
            width: 0;
            height: 0;
        }
    }
    @media screen and (max-width: 480px) {
        .seasons {
            overflow: hidden;
            width: 0;
            height: 0;
        }
    }
    @media screen and (max-width: 430px) {
        .disk {
            overflow: hidden;
            width: 0;
            height: 0;
        }
        .grid {
            margin: 0;
            width: 100%;
        }
    }
    @media screen and (max-width: 400px) {
        .number {
            overflow: hidden;
            width: 0;
            height: 0;
        }
    }
    @media screen and (max-width: 250px) {
        .time {
            overflow: hidden;
            width: 0;
            height: 0;
        }
    } 
</style>
