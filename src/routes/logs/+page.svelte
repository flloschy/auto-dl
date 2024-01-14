<script lang="ts">
    export let data;
</script>

<div>
{#each data.lines as line}
    {line}<br>
{/each}
</div>


<style>
    div {
        width: 50%;
        margin: auto;
    }
    @media screen and (max-width: 300px) {
        div {
            width: 100%;
        }
    }
</style>