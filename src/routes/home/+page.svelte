<script lang="ts">
	import { formatDuration } from '$lib/helper';
	import {
		maxAutoIntervalSeconds,
		maxWaitlistIntervalSeconds,
		minAutoIntervalSeconds,
		minWaitlistIntervalSeconds,
		stepsAutoInterval,
		stepsWaitlistInterval,
	} from '$lib/helper';
	import { onMount } from 'svelte';
	import { pushToast } from '../toast';
	import { goto } from '$app/navigation';
	import Modal from '../../elements/Modal.svelte';
	import { enhance } from '$app/forms';

	export let data;
	export let form;
	$: form
		? pushToast(
				form.success ? 'Successfully added!' : 'Invalid URL',
				!form.success,
			)
		: null;

	const aais = maxAutoIntervalSeconds;
	const awis = maxWaitlistIntervalSeconds;
	const iais = minAutoIntervalSeconds;
	const iwis = minWaitlistIntervalSeconds;
	const sai = stepsAutoInterval;
	const swi = stepsWaitlistInterval;

	let autoInterval = data.settings.channelListIntervalTime;
	let waitlistInterval = data.settings.waitListIntervalTime;
	let toggle = data.settings.autoDownloadingEnabled;

	let autoIntervalElement: HTMLInputElement;
	let waitlistIntervalElement: HTMLInputElement;
	let toggleElement: HTMLInputElement;

	let cpu = 0;
	let memory = 0;
	let storage = 0;

	onMount(() => {
		autoIntervalElement = document.getElementById(
			'autoInterval',
		) as HTMLInputElement;
		waitlistIntervalElement = document.getElementById(
			'waitlistInterval',
		) as HTMLInputElement;
		toggleElement = document.getElementById('toggle') as HTMLInputElement;

		const updateServerStats = () => {
			fetch('/api/system/cpu').then(async (d) => (cpu = await d.json()));
			fetch('/api/system/memory').then(
				async (d) => (memory = await d.json()),
			);
			fetch('/api/system/storage').then(
				async (d) => (storage = await d.json()),
			);
		};
		updateServerStats();
		setInterval(updateServerStats, 10000);
	});

	let updates = 0;
	const updated = async () => {
		const tmpA = parseInt(autoIntervalElement.value);
		const tmpW = parseInt(waitlistIntervalElement.value);
		const tmpT = toggleElement.checked;
		const update = updates++ + 1;

		setTimeout(async () => {
			if (update == updates) {
				updates = 0;
				pushToast('Updating Settings...');
				await fetch('/api/settings', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						autoInterval: tmpA,
						waitlistInterval: tmpW,
						toggle: tmpT,
					}),
				});

				pushToast('Updated Settings!');
			}
		}, 1500);
	};

	let downloadVideoModal = false;
</script>

<svelte:head>
	<title>AutoDl - Welcome! ({data.system.onWaitlist})</title>
</svelte:head>

<Modal bind:open={downloadVideoModal}>
	<h2>Add a video to the waitlist</h2>
	<form class="modalgrid" method="post" use:enhance>
		<input name="url" placeholder="Video URL" />
		<button on:click={() => (downloadVideoModal = false)}>Submit</button>
	</form>
</Modal>

<div class="container">
	<div class="serverstats">
		<h2>Server Stats</h2>
		<table>
			<tr>
				<td>CPU</td>
				<td><strong data-p>{cpu.toFixed(1)}%</strong></td>
			</tr>
			<tr>
				<td>Memory</td>
				<td><strong data-p>{memory.toFixed(1)}%</strong></td>
			</tr>
			<tr>
				<td>Storage</td>
				<td><strong data-p>{storage.toFixed(1)}%</strong></td>
			</tr>
			<tr>
				<td>IP</td>
				<td>
					{data.ip}
				</td>
			</tr>
		</table>
	</div>
	<div class="systemstats">
		<h2>System Stats</h2>
		<table>
			<tr>
				<td>Total Channels</td>
				<td><strong data-p>{data.system.channels}</strong></td>
			</tr>
			<tr>
				<td>Total Seasons</td>
				<td><strong data-p>{data.system.seasons}</strong></td>
			</tr>
			<tr>
				<td>Total Episodes</td>
				<td><strong data-p>{data.system.episodes}</strong></td>
			</tr>
		</table>
	</div>
	<div class="downloaderstats">
		<h2>Downloader Stats</h2>
		<table>
			<tr>
				<td>On Wait list</td>
				<td><strong data-p>{data.system.onWaitlist}</strong></td>
			</tr>
			<tr>
				<td>On Channel list</td>
				<td><strong data-p>{data.system.onChannellist}</strong></td>
			</tr>
		</table>
	</div>
	<div class="settings">
		<h2>Settings</h2>
		<table>
			<tr>
				<td>Automatic Downloading</td>
				<t
					><input
						type="checkbox"
						id="toggle"
						on:input={updated}
						bind:checked={toggle}
					/>
				</t></tr
			>
			<tr>
				<td>Auto Interval</td>
				<td
					><input
						type="range"
						id="autoInterval"
						on:input={updated}
						min={iais}
						max={aais}
						step={sai}
						bind:value={autoInterval}
					/>
					<strong data-p>{formatDuration(autoInterval)}</strong></td
				>
				<td></td>
			</tr>
			<tr>
				<td>Wait list Interval</td>
				<td
					><input
						type="range"
						id="waitlistInterval"
						on:input={updated}
						min={iwis}
						max={awis}
						step={swi}
						bind:value={waitlistInterval}
					/>
					<strong data-p>{formatDuration(waitlistInterval)}</strong
					></td
				>
			</tr>
		</table>
	</div>
	<div class="actions">
		<h2>Quick Actions</h2>
		<div class="grid">
			<button
				data-s
				on:click={() => {
					fetch('api/waitlist/run/waitlist');
					pushToast('Running Waitlist...');
				}}>Run Waitlist</button
			>
			<button
				data-s
				on:click={() => {
					fetch('api/waitlist/run/channel');
					pushToast('Running Channel list...');
				}}>Run Channellist</button
			>
			<button on:click={() => goto('/channel/new')}>Add Channel</button>
			<button on:click={() => (downloadVideoModal = true)}
				>Append Waitlist</button
			>
		</div>
	</div>
</div>

<style>
	.modalgrid {
		display: grid;
		grid-template-columns: 1fr auto;
		column-gap: 10px;
	}

	.container {
		display: grid;
		grid-template-columns: auto auto auto;
		grid-template-rows: auto auto;
		gap: 0px 0px;
		grid-auto-flow: row;
		grid-template-areas:
			'serverstats systemstats downloaderstats'
			'settings settings actions';
	}

	@media screen and (max-width: 550px) {
		.container {
			grid-template-columns: auto auto;
			grid-template-rows: auto auto auto;
			grid-template-areas:
				'serverstats systemstats'
				'downloaderstats downloaderstats'
				'settings actions';
		}
	}
	@media screen and (max-width: 450px) {
		.container {
			grid-template-columns: auto;
			grid-template-rows: auto auto auto auto auto auto;
			grid-template-areas:
				'serverstats'
				'systemstats'
				'downloaderstats'
				'downloaderstats'
				'settings'
				'actions';
		}
		.modalgrid {
			display: grid;
			grid-template-columns: 1fr;
			column-gap: 10px;
		}
	}
	.serverstats {
		grid-area: serverstats;
	}

	.systemstats {
		grid-area: systemstats;
	}

	.downloaderstats {
		grid-area: downloaderstats;
	}

	.settings {
		grid-area: settings;
	}

	.actions {
		grid-area: actions;
	}

	.grid {
		display: grid;
		grid-template-columns: auto auto;
		grid-template-rows: auto auto;
		gap: 2px 2px;
	}
</style>
