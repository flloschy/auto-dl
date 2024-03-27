<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;
</script>

<div class="center">
	<div>
		<header>
			<b>Filter:</b>
			{#each ['ALL', 'SETUP', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as t}
				<a class:on={data.filter == t} href="/logs/0/filter/{t}">{t}</a>
			{/each}
		</header>
		<br />
		<br />
		<br />

		<div class="list">
			<div>Type</div>
			<div>Time</div>
			<abbr title="details">Message</abbr>
			<div class="hide">Location</div>
			{#each data.logs as log}
				<b class={log.type}>{log.type}</b>
				<div>{log.time.toLocaleDateString()}<br />{log.time.toLocaleTimeString()}</div>
				{#if log.details.length > 0}
					<abbr title={log.details}>{log.message}</abbr>
				{:else}
					<div>{log.message}</div>
				{/if}
				<div class="hide">{log.origin.file}<br />{log.origin.fn ? log.origin.fn + '()' : ''}</div>
			{/each}
		</div>
		{#if data.page == data.maxPage && data.filter == 'ALL'}
			<form method="post" class="center">
				<button data-red style="font-weight: 900"
					>⚠️ DANGER ⚠️<br />DELETE ALL LOGS<br />THIS CANNOT BE REVERSED<br />⚠️ DANGER ⚠️</button
				>
			</form>
		{/if}
		<br />
		<br />

		<footer>
			<div>
				<button disabled={data.page == 0} on:click={() => goto(`/logs/0/filter/${data.filter}/`)}
					>◀◀◀</button
				>
				<button
					disabled={data.page == 0}
					on:click={() => goto(`/logs/${data.page - 1}/filter/${data.filter}/`)}>◀</button
				>
				<b class="preview">
					{#if data.page != 0}
						{data.page - 1}
					{:else}
						|
					{/if}
				</b>
				<b class="page">{data.page}</b>
				<b class="preview">
					{#if data.page < data.maxPage}
						{data.page + 1}
					{:else}
						|
					{/if}
				</b>
				<button
					disabled={data.page == data.maxPage}
					on:click={() => goto(`/logs/${data.page + 1}/filter/${data.filter}/`)}>▶</button
				>
				<button
					disabled={data.page == data.maxPage}
					on:click={() => goto(`/logs/${data.maxPage}/filter/${data.filter}/`)}>▶▶▶</button
				><br />
			</div>
		</footer>
	</div>
</div>

<style lang="scss">
	.on {
		text-decoration: underline;
	}
	footer {
		display: flex;
		justify-content: center;
	}

	.page {
		font-weight: 900;
	}
	.preview {
		opacity: 0.8;
	}

	header {
		display: flex;
		justify-content: space-between;
		column-gap: 10px;
		row-gap: 5px;
		flex-direction: row;
		flex-wrap: wrap;
	}
	.list {
		display: grid;
		grid-template-columns: 1fr auto auto auto;
		width: fit-content;

		column-gap: 10px;
		row-gap: 20px;
	}

	.center {
		padding-top: 70px;
		display: flex;
		justify-content: center;
	}

	b {
		text-align: center;
		border-radius: 10px;
		height: fit-content;
		padding-right: 5px;
		padding-left: 5px;
		background-color: black;
		font-weight: 900;
	}
	.SETUP {
		color: black;
		background-color: white;
	}
	.DEBUG {
		background-color: blueviolet;
	}
	.INFO {
		background-color: blue;
	}
	.WARNING {
		color: black;
		background-color: yellow;
	}
	.ERROR {
		color: red;
		background-color: black;
	}
	.CRITICAL {
		color: black;
		background-color: red;
		text-decoration: underline;
	}

	@media only screen and (max-width: 700px) {
		.hide {
			display: none;
		}
		.list {
			grid-template-columns: 1fr auto auto;
		}
	}
</style>
