<script lang="ts">
	export let code: string;
	export let info: string | undefined = undefined;
</script>

<span
	title={info}
	class="material-symbols-rounded {$$restProps.class || ''}"
	style={$$restProps.style || ''}>{code}</span
>

<style>
	span {
		color: theme('colors.accent.500');
		user-select: none;
	}
	span.inherit {
		color: inherit;
	}
</style>
