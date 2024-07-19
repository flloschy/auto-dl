<script lang="ts">
	import { onMount } from 'svelte';
	import OutputRender from '../uiLib/OutputRender.svelte';

	export let data;
	let output = data.logs;

	onMount(async () => {
		const SSE = new EventSource(`/output/get?id=${data.id}`);
		SSE.onmessage = async (event: MessageEvent) => {
			output = JSON.parse(event.data);
		};
	});

	function msToTimeStamp() {
		const expiresIn =
			1000 * // 1 second
			60 * // 1 minute
			60 * // 1 hour
			24 * // 1 day
			2; // 2 days

		const dead = data.finished + expiresIn;
		const diff = dead - Date.now();
		const date = new Date(diff);

		const days = (date.getDate() - 1).toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');

		return `${days}d ${hours}h ${minutes}m ${seconds}s`;
	}

	let time = msToTimeStamp();

	setInterval(() => (time = msToTimeStamp()), 1100);
</script>

{#if data.finished != -1}
	<p style="text-align: center">Will be deleted in {time}</p>
{/if}

<OutputRender {output} />
