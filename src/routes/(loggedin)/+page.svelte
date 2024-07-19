<script lang="ts">
	import CustomSelect from './uiLib/CustomSelect.svelte';
	import type {
		executionReturn,
		frontEndReadyCommand,
		frontEndReadySubCommand,
		logMessage
	} from '$lib/commandManager/commandLib/UtilityTypes';
	import OutputRender from './uiLib/OutputRender.svelte';

	export let data;

	let values: {
		arguments: string[];
		options: { [key: string]: string };
	} = {
		arguments: [],
		options: {}
	};
	let activeBaseCommand: frontEndReadyCommand | undefined = undefined;
	let activeSubCommand: frontEndReadySubCommand | undefined = undefined;
	let activeCommand: frontEndReadyCommand | frontEndReadySubCommand | undefined = undefined;
	let output: logMessage[] | undefined = undefined;

	function updateValues() {
		const tmpValues: {
			arguments: string[];
			options: { [key: string]: string };
		} = {
			arguments: [],
			options: {}
		};
		if (activeCommand) {
			activeCommand.arguments.forEach(() => tmpValues.arguments.push(''));
			Object.keys(activeCommand.options).forEach((opt) => (tmpValues[opt] = ''));
		}
		values = tmpValues;
	}

	async function requestExecution() {
		const body = new FormData();
		if (!activeBaseCommand) return;

		body.append('command', activeBaseCommand.name);
		if (activeSubCommand) body.append('subCommand', activeSubCommand.name);

		body.append('argument', JSON.stringify(values.arguments));
		body.append('options', JSON.stringify(values.options));

		const response = await fetch('/api/execute', {
			method: 'post',
			body
		});

		const json = (await response.json()) as executionReturn;

		if (json.result) {
			if (json.result.success) {
				output = json.result.output;
			} else {
				alert(json.result.output);
			}
		} else if (json.redirect) {
			window.open(`/output?id=${json.redirect}`, '_blank');
		}
	}
</script>

<div class="grid">
	<CustomSelect
		{values}
		name="commands"
		options={Object.keys(data.commands)}
		descriptions={Object.values(data.commands).map((cmd) => ({
			name: cmd.name,
			description: cmd.description
		}))}
		updateValue={(text) => {
			const command = data.commands[text];
			if (command) {
				activeBaseCommand = command;
				activeCommand = activeBaseCommand;
			} else {
				activeBaseCommand = undefined;
				activeSubCommand = undefined;
				activeCommand = undefined;
			}
			updateValues();
		}}
	/>

	{#if activeBaseCommand != undefined && Object.keys(activeBaseCommand.subCommands).length != 0}
		<CustomSelect
			{values}
			name="Sub Command"
			options={Object.keys(activeBaseCommand.subCommands)}
			descriptions={Object.values(activeBaseCommand.subCommands).map((sub) => ({
				name: sub.name,
				description: sub.description
			}))}
			updateValue={(text) => {
				if (!activeBaseCommand) return;
				const command = activeBaseCommand.subCommands[text];
				if (command) {
					activeSubCommand = command;
					activeCommand = activeSubCommand;
				} else {
					activeSubCommand = undefined;
					activeCommand = activeBaseCommand;
				}
				updateValues();
			}}
		/>
	{/if}

	{#if activeCommand}
		{#if activeCommand.arguments.length != 0}
			<p style="text-align: center">Arguments</p>
			{#each activeCommand.arguments as arg, i}
				<CustomSelect
					{values}
					name={arg.name}
					description={arg.description}
					typeString={arg.typeString}
					autoCompleteParentPath={`${activeBaseCommand?.name}${activeSubCommand ? '/subcommand/' + activeSubCommand.name : ''}/argument`}
					updateValue={(text) => {
						values.arguments[i] = text;
					}}
				/>
			{/each}
		{/if}
		{#if Object.values(activeCommand.options).length != 0}
			<p style="text-align: center">Options</p>
			{#each Object.values(activeCommand.options) as opt}
				<CustomSelect
					{values}
					name={opt.name}
					description={opt.description}
					typeString={opt.typeString}
					autoCompleteParentPath={`${activeBaseCommand?.name}${activeSubCommand ? '/subcommand/' + activeSubCommand.name : ''}/option`}
					updateValue={(text) => {
						values.options[opt.name] = text;
					}}
				/>
			{/each}
		{/if}
		<button on:click={requestExecution}>Execute Command</button>
	{/if}

	{#if output != undefined}
		<div>
			<OutputRender {output} />
		</div>
	{/if}
</div>

<style>
	.grid {
		display: flex;
		width: 100%;
		flex-direction: column;
		row-gap: 0.8rem;
	}
	button {
		padding: 1em;
		border-radius: 1em;
		background-color: var(--secondary);
		color: var(--text);
		outline: none;
		border: none;
		transition: all 200ms ease-out;
	}
	button:hover,
	button:focus {
		background-color: var(--primary);
	}
</style>
