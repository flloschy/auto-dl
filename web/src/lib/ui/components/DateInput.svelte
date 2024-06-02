<script lang="ts">
	import { replaceAt } from '$lib/frontendUtil';

	const placeholder = '0000-00-00 00:00:00';
	export let value = placeholder;
	export let name = '';

	// 2024-03-30 19:06:27
	const numbers = '0123456789';
	let i = 0;

	function handle(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (placeholder[i] == '0' && numbers.includes(e.key)) {
			value = replaceAt(value, i, e.key);
			i = Math.max(0, Math.min(i + 1, placeholder.length));
			if (placeholder[i] != '0') {
				value = replaceAt(value, i, placeholder[i]);
				i = Math.max(0, Math.min(i + 1, placeholder.length));
			}
		} else if (e.key == 'Backspace') {
			i = Math.max(0, Math.min(i - 1, placeholder.length));
			if (placeholder[i] != '0') {
				i = Math.max(0, Math.min(i - 1, placeholder.length));
			}
			value = replaceAt(value, i, '0');
		} else if (e.key == 'ArrowUp') {
			i = placeholder.length;
		} else if (e.key == 'ArrowDown') {
			i = 1;
		} else if (e.key == 'ArrowRight') {
			i = Math.max(0, Math.min(i + 1, placeholder.length));
		} else if (e.key == 'ArrowLeft') {
			i = Math.max(0, Math.min(i - 1, placeholder.length));
		}
	}
</script>

<input
	on:keydown|preventDefault={handle}
	{value}
	{name}
	class={$$restProps.class || ''}
	style={$$restProps.style || ''}
/>
