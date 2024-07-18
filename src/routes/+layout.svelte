<script lang="ts">
	import { onMount } from "svelte";
    import "./global.css"

    function resize() {
        const main = document.getElementById("main") as HTMLDivElement
        const width = main.getBoundingClientRect().width
        document.documentElement.style.setProperty("--width", `${width}px`)
    }

    onMount(resize)
</script>

<div>
    <main id="main">
        <slot />
    </main>
</div>


<svelte:window on:resize={resize} />

<style>
    main {
        max-width: 600px;
        width: 100%;
    }
    div {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
    }
</style>