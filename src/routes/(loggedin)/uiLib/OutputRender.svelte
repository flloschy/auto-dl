<script lang="ts">
	import type { logMessage } from "$lib/commandManager/commandLib/UtilityTypes";

    export let output: logMessage[];
</script>

<div class="block">
    {#each output as line}
        <div>
            {#each line as part}
                {#if typeof part == "string"}
                    <p>{part}</p>
                {:else}
                    <p style="color: {part.color}">{part.message}</p>
                {/if}
            {/each}
        </div>
    {/each}
</div>

<style>
    .block {
        width: 100%;
        padding: 1em;
        border-radius: 1em;
        background-color: rgb(31, 31, 31);
        overflow-x: scroll;
    }
    .block div p {
        margin: 0;
        display: inline;
        min-height: 0.65em;
        min-width: max-content;
        width: 100%;
    }
    .block div {
        min-width: max-content;
        width: 100%;

        display: flex;
        column-gap: 0.4em;
        flex-wrap: nowrap;

        margin: 0;
        padding-left: 5px;
        padding-right: 5px;
        padding-top: 3px;
        padding-bottom: 3px;
    }
</style>