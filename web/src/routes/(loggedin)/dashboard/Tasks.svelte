<script lang="ts">
	import Icon from '$lib/ui/components/Icon.svelte';
	import { toaster } from '$lib/ui/toast/toaster';
	import { taskStore } from '../background';
	import Task from './Task.svelte';

	const deleteAll = (state: 'running' | 'stopped' | 'done' | 'error') => {
		toaster.success('Deleted all ' + state + ' Tasks');
	};
</script>

<div class="flex flex-col flex-wrap gap-x-10">
	<h1 class="text-xl">Tasks</h1>
	<div class="grid grid-cols-1 gap-x-3 lg:grid-cols-3">
		<div class="col-span-1 lg:col-span-3">
			<h1 class="text-lg flex gap-x-2 align-center">
				Running ({Object.values($taskStore).filter((t) => t.state == 'running').length})
			</h1>
			<div class="flex flex-col gap-y-2 overflow-scroll max-h-[420px] verticalOverflowGradient">
				{#each Object.values($taskStore)
					.filter((t) => t.state == 'running')
					.sort((a, b) => b.progress - a.progress) as task}
					<Task
						title={task.title}
						detail={task.detail}
						id={task.id}
						process={task.process}
						progress={task.progress}
						done={false}
					/>
				{/each}
			</div>
		</div>
		<div class="h-fit">
			<h1 class="text-lg flex gap-x-2 align-center">
				<button on:click={() => deleteAll('done')}
					><Icon code="delete" info="Delete all Completed Tasks" /></button
				>
				<p>Done ({Object.values($taskStore).filter((t) => t.state == 'done').length})</p>
			</h1>
			<div class="flex flex-col gap-y-2 overflow-scroll max-h-[420px] verticalOverflowGradient">
				{#each Object.values($taskStore).filter((t) => t.state == 'done') as task}
					<Task
						title={task.title}
						detail={task.detail}
						id={task.id}
						process={task.process}
						progress={task.progress}
						done={true}
					/>
				{/each}
			</div>
		</div>
		<div class="h-fit">
			<h1 class="text-lg flex gap-x-2 align-center">
				<button on:click={() => deleteAll('error')}
					><Icon code="delete" info="Delete all Failed Tasks" /></button
				>
				<p>Error ({Object.values($taskStore).filter((t) => t.state == 'error').length})</p>
			</h1>
			<div class="flex flex-col gap-y-2 overflow-scroll max-h-[420px] verticalOverflowGradient">
				{#each Object.values($taskStore).filter((t) => t.state == 'error') as task}
					<Task
						title={task.title}
						detail={task.detail}
						id={task.id}
						process={task.process}
						progress={task.progress}
						done={true}
					/>
				{/each}
			</div>
		</div>
	</div>
</div>
