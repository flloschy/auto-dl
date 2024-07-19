<script lang="ts">
	import type {
		apiTypingReturn,
		commandValueObject
	} from '$lib/commandManager/commandLib/UtilityTypes';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	export let autoCompleteParentPath: string = '';
	export let descriptions: (object & { name: string; description: string })[] = [];
	export let description: string = '';
	export let typeString: string = '';
	export let options: string[] = [];
	export let name: string = '';
	export let value: string = '';
	export let updateValue: (value: string) => void = () => {};
	export let values: commandValueObject = {
		arguments: [],
		options: []
	};
	export let optional: boolean = false;
	let invalid = false;
	let selectedI = 0;
	let focused = false;

	async function fetchOptions() {
		if (autoCompleteParentPath != '') {
			const body = new FormData();
			body.append('value', value);
			body.append('values', JSON.stringify(values));

			const response = await fetch(`/api/autoComplete/${autoCompleteParentPath}/${name}`, {
				method: 'post',
				body
			});

			const json = (await response.json()) as apiTypingReturn;

			if (json.options) {
				options = json.options;
				invalid = json.invalid;
			}
		}
	}

	onMount(fetchOptions);

	function keydown(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (e.key == 'ArrowDown') {
			selectedI = selectedI + 1;
			if (selectedI >= options.length) selectedI = 0;
			value = options[selectedI];
			updateValue(value);
		}
		if (e.key == 'ArrowUp') {
			selectedI = selectedI - 1;
			if (selectedI < 0) selectedI = options.length - 1;
			value = options[selectedI];
			updateValue(value);
		}
	}
</script>

<div class="customSelect" class:focused class:invalid>
	<input
		class:focused
		placeholder={(optional ? '(optional) ' : '') + name}
		on:focusin={() => {
			fetchOptions();
			focused = true;
		}}
		on:focusout={() => {
			fetchOptions();
			focused = false;
		}}
		bind:value
		on:keydown={keydown}
		on:input={() => {
			fetchOptions();
			updateValue(value);
		}}
	/>
	{#if focused}
		<div class="popup" transition:slide={{ axis: 'y', delay: 100, duration: 200 }}>
			<div class="popupContent">
				{#if descriptions && options && descriptions.length == options.length && options.length != 0 && descriptions[selectedI]}
					<div class="info">
						<p class="title">{descriptions[selectedI].name}</p>
						<p>{descriptions[selectedI].description}</p>
					</div>
				{:else}
					<div class="info">
						{#if typeString}
							<p class="type">[{typeString}]</p>
						{/if}
						{#if name}
							<p class="title">{name}</p>
						{/if}
						{#if description}
							<p>{description}</p>
						{/if}
					</div>
				{/if}
				<div class="suggestions">
					{#each options as option, i}
						<div class:selected={selectedI == i}>{i}.</div>
						<div class:selected={selectedI == i}>{option}</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.type {
		color: var(--background);
		font-size: 0.7em;
	}
	.popupContent {
		min-width: 100%;
		width: fit-content;
	}

	.popup {
		background-color: var(--primary);
		padding: 1em;
		padding-top: 0.5em;
		/* width: 100%; */
		width: var(--width);
		max-width: 600px;
		display: flex;
		flex-direction: column;
		border-bottom-left-radius: 1em;
		border-bottom-right-radius: 1em;
		/* position: absolute; */
		row-gap: 1em;
		z-index: 999;
		overflow-x: scroll;
	}

	.info {
		bottom: 2.6em;
		display: grid;

		grid-template-rows: auto 1fr;
		column-gap: 10px;
		border-top-left-radius: 1em;
		border-top-right-radius: 1em;
	}
	.info .title {
		font-weight: 800;
	}
	.info p {
		margin: 0;
		padding: 0;
	}
	.customSelect.invalid input,
	.customSelect.invalid input::placeholder {
		text-decoration: underline red wavy;
	}
	input {
		padding: 1em;
		outline: none;
		border: none;
		background-color: var(--primary);
		color: var(--background);
		border-radius: 1em;
		transition: all 150ms 250ms ease-out;
		width: 100%;
	}
	input::placeholder {
		color: var(--secondary);
	}
	input.focused {
		transition: all 100ms ease-out;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		background-color: var(--accent);
	}
	.suggestions {
		background-color: var(--secondary);
		display: grid;
		width: 100%;
		grid-template-columns: auto 1fr;
		padding: 0.5em;
		border-radius: 0.5em;
	}
	.suggestions div:nth-child(odd) {
		padding-right: 1em;
		padding-left: 0.25em;
	}
	.suggestions div:nth-child(even) {
		padding-right: 0.6em;
	}
	.suggestions div.selected {
		background-color: var(--accent);
		color: var(--background);
	}
	.suggestions div.selected:nth-child(odd) {
		border-top-left-radius: 1em;
		border-bottom-left-radius: 1em;
	}
	.suggestions div.selected:nth-child(even) {
		border-top-right-radius: 1em;
		border-bottom-right-radius: 1em;
	}
</style>
