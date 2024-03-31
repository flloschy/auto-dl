<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let data;
	let runningIn = '< loading >';
	if (browser) {
		function msToTime(t: number) {
			const date = new Date();
			date.setTime(t);

			const d = date.getDate() - 1;
			const h = date.getHours();
			const m = date.getMinutes();
			const s = date.getSeconds();
			return `${d.toString().padStart(2, '0')}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
		}

		function update() {
			if (data.auto) {
				const diff = data.next - Date.now();
				console.log(diff);
				runningIn = msToTime(diff);
			} else {
				runningIn = 'never (disabled)';
			}
		}

		setInterval(update, 1000);
		update();
	}

	function update() {
		(document.getElementById('form') as HTMLFormElement).submit();
	}
</script>

<div class="center-container">
	<div class="values-list" style="gap: 20px;" id="main">
		<div class="wrap">
			<h4>System</h4>

			<div class="values-list">
				<div>IP</div>
				<code class="select-all">{data.ip}</code>
				<div>next</div>
				<code>{runningIn}</code>
			</div>
		</div>

		<div class="wrap">
			<h4>Settings</h4>
			<form method="post" id="form" action="?/settings">
				<div class="values-list">
					<div>Interval</div>
					<div>
						<input
							name="interval"
							type="range"
							bind:value={data.interval}
							min={1}
							max={168}
							on:change={update}
						/>
						<code
							>{Math.floor(data.interval / 24)}d {(data.interval % 24)
								.toString()
								.padStart(2, '0')}h</code
						>
					</div>

					<div>Auto</div>
					<input name="auto" type="checkbox" bind:checked={data.auto} on:input={update} />
				</div>
			</form>
		</div>

		<div class="wrap">
			<h4>Stats</h4>

			<div class="values-list">
				<div>channels</div>
				<code>{data.channels}</code>
				<div>seasons</div>
				<code>{data.seasons}</code>
				<div>videos</div>
				<code>{data.videos}</code>
				<div>waitlist</div>
				<code>{data.waitlist}</code>
			</div>
		</div>

		<div class="wrap">
			<h4>Actions</h4>
			<div class="values-list">
				<button data-green on:click={() => goto('/channels/add')}>Add Channel</button>
				<form method="post" action="?/channel">
					<button>Run Channel list</button>
				</form>
				<button data-green on:click={() => goto('/waitlist/add')}>Add Waitlist</button>
				<form method="post" action="?/waitlist">
					<button>Run Waitlist</button>
				</form>
				<form method="post" action="?/reset">
					<button data-red>Reset Interval</button>
				</form>
				<button on:click={() => goto('/export')}>Export</button>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.wrap {
		width: fit-content;
	}
	@media only screen and (max-width: 600px) {
		#main {
			grid-template-columns: 1fr;
		}
	}
	.values-list > form {
		width: 100%;
		& > button {
			width: 100%;
		}
	}
</style>
