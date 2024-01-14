<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { pushToast } from '../../toast';
	export let form;
	const success = () => {
		pushToast('Created Channel', false);
		goto('/channel/' + form);
	};
	onMount(() => {
		form ? success() : null;
	});
</script>

<svelte:head>
	<title>AutoDl - New Channel</title>
</svelte:head>

<form method="post" use:enhance>
	<div>Id</div>
	<div class="grid">
		<input
			name="id"
			placeholder="channel ID"
			on:keydown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
		/>
		<small
			><a
                class="converterLink"
				data-p
				target="_blank"
				href="https://www.streamweasels.com/tools/youtube-channel-id-and-user-id-convertor/"
				>converter</a
			></small
		>
	</div>
	<div>Name</div>
	<input
		name="name"
		placeholder="Name"
		on:keydown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
	/>
	<div>Description</div>
	<textarea name="description" placeholder="Description" rows="5"></textarea>
	<div>AutoDl</div>
	<input name="auto" type="checkbox" />
	<div>AudioOnly&trade;</div>
	<input name="audio" type="checkbox" />
	<div />
	<button>Confirm</button>
</form>

<style>
   
	.grid {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}
	.grid > small {
		font-size: 0.7rem;
		padding-left: 5px;
	}

	form {
		display: grid;
		grid-template-columns: auto 1fr;
		justify-items: start;
		gap: 5px 10px;
		width: 50%;
		margin: auto;
	}
    
    .converterLink {
        display: block
    }
    @media screen and (max-width: 700px) {
        form {
            width: 100%;
        }
    }
    @media screen and (max-width: 400px) {
        .converterLink {
            width: 80%;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
    @media screen and (max-width: 300px) {
        .converterLink {
            width: 50%;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    } 
    @media screen and (max-width: 250px) {
        .converterLink {
            width: 25%;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    } 
	input,
	textarea {
		width: 100%;
	}
	input[type='checkbox'] {
		width: fit-content;
	}
</style>
