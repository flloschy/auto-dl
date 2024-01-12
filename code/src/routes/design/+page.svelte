<script lang="ts">
	import Modal from '../../elements/Modal.svelte';

	let show = false;
	let show2 = false;
</script>

<svelte:head>
	<title>AutoDl - Psst, this is a secret!</title>
</svelte:head>

<div
	style="padding: 20px; background-color: black; display: flex; justify-content: center; align-content: center;"
>
	<div
		style="width: 60px; display:grid; aspect-ratio: 1; background-color: var(--t); color: var(--bg); justify-content: center; align-content: center; font-size: 30px; border-radius: 50%; margin-top: 100px;margin-bottom: 100px;"
	>
		<div
			style="font-family: 'Fugaz One', sans-serif; font-size: 2.5rem; transform: translate(-5%, 0); text-shadow: 5px 5px 0 var(--bgt);"
		>
			A
		</div>
	</div>
</div>

<button on:click={() => (show = true)}></button>

<button on:click={() => (show = true)}>open Modal</button>
<Modal bind:open={show}>
	<h1>Hallo, das ist ein cooles Modal!</h1>
	<p>
		Lorem ipsum dolor sit amet consectetur, adipisicing elit. Esse
		consequatur dolorum ratione perspiciatis corporis nesciunt architecto
		corrupti harum ducimus dignissimos facere aliquid quidem, adipisci ad a?
		Reiciendis iste corporis voluptates?
	</p>
	<table>
		<tr>
			<td
				>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus
				repudiandae illum distinctio non voluptate pariatur esse dolores
				et explicabo quisquam, numquam ab. Molestiae quam reiciendis,
				consectetur libero numquam eveniet consequuntur.</td
			>
			<td
				>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus
				repudiandae illum distinctio non voluptate pariatur esse dolores
				et explicabo quisquam, numquam ab. Molestiae quam reiciendis,
				consectetur libero numquam eveniet consequuntur.</td
			>
		</tr><br />
		<tr>
			<td
				>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus
				repudiandae illum distinctio non voluptate pariatur esse dolores
				et explicabo quisquam, numquam ab. Molestiae quam reiciendis,
				consectetur libero numquam eveniet consequuntur.</td
			>
			<td
				>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus
				repudiandae illum distinctio non voluptate pariatur esse dolores
				et explicabo quisquam, numquam ab. Molestiae quam reiciendis,
				consectetur libero numquam eveniet consequuntur.</td
			>
		</tr>
	</table>

	<table>
		<tr>
			<td>Name</td>
			<td><input placeholder="Olaf scholz" /></td>
		</tr>
		<tr>
			<td>Description</td>
			<td><textarea placeholder="A Politian"></textarea></td>
		</tr>
		<tr>
			<td>Age</td>
			<td><input type="range" /></td>
		</tr>
		<tr>
			<td>Age</td>
			<td><input data-p type="range" /></td>
		</tr>
		<tr>
			<td>Age</td>
			<td><input data-s type="range" /></td>
		</tr>
		<tr>
			<td>Born</td>
			<td>60 years ago</td>
		</tr>
	</table>
	<br /><br /><br />
	Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum
	sunt magnam dolorum perferendis similique, aut quo possimus omnis deserunt animi
	amet impedit facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet
	consectetur adipisicing elit. Ullam error beatae rerum sunt magnam dolorum perferendis
	similique, aut quo possimus omnis deserunt animi amet impedit facilis dicta sapiente
	nam delectus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam
	error beatae rerum sunt magnam dolorum perferendis similique, aut quo possimus
	omnis deserunt animi amet impedit facilis dicta sapiente nam delectus. Lorem
	ipsum dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum sunt
	magnam dolorum perferendis similique, aut quo possimus omnis deserunt animi amet
	impedit facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet consectetur
	adipisicing elit. Ullam error beatae rerum sunt magnam dolorum perferendis similique,
	aut quo possimus omnis deserunt animi amet impedit facilis dicta sapiente nam
	delectus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam error
	beatae rerum sunt magnam dolorum perferendis similique, aut quo possimus omnis
	deserunt animi amet impedit facilis dicta sapiente nam delectus. Lorem ipsum
	dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum sunt magnam
	dolorum perferendis similique, aut quo possimus omnis deserunt animi amet impedit
	facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet consectetur adipisicing
	elit. Ullam error beatae rerum sunt magnam dolorum perferendis similique, aut
	quo possimus omnis deserunt animi amet impedit facilis dicta sapiente nam delectus.
	Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum
	sunt magnam dolorum perferendis similique, aut quo possimus omnis deserunt animi
	amet impedit facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet
	consectetur adipisicing elit. Ullam error beatae rerum sunt magnam dolorum perferendis
	similique, aut quo possimus omnis deserunt animi amet impedit facilis dicta sapiente
	nam delectus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam
	error beatae rerum sunt magnam dolorum perferendis similique, aut quo possimus
	omnis deserunt animi amet impedit facilis dicta sapiente nam delectus. Lorem
	ipsum dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum sunt
	magnam dolorum perferendis similique, aut quo possimus omnis deserunt animi amet
	impedit facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet consectetur
	adipisicing elit. Ullam error beatae rerum sunt magnam dolorum perferendis similique,
	aut quo possimus omnis deserunt animi amet impedit facilis dicta sapiente nam
	delectus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam error
	beatae rerum sunt magnam dolorum perferendis similique, aut quo possimus omnis
	deserunt animi amet impedit facilis dicta sapiente nam delectus. Lorem ipsum
	dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum sunt magnam
	dolorum perferendis similique, aut quo possimus omnis deserunt animi amet impedit
	facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet consectetur adipisicing
	elit. Ullam error beatae rerum sunt magnam dolorum perferendis similique, aut
	quo possimus omnis deserunt animi amet impedit facilis dicta sapiente nam delectus.
	Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum
	sunt magnam dolorum perferendis similique, aut quo possimus omnis deserunt animi
	amet impedit facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet
	consectetur adipisicing elit. Ullam error beatae rerum sunt magnam dolorum perferendis
	similique, aut quo possimus omnis deserunt animi amet impedit facilis dicta sapiente
	nam delectus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam
	error beatae rerum sunt magnam dolorum perferendis similique, aut quo possimus
	omnis deserunt animi amet impedit facilis dicta sapiente nam delectus. Lorem
	ipsum dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum sunt
	magnam dolorum perferendis similique, aut quo possimus omnis deserunt animi amet
	impedit facilis dicta sapiente nam delectus. Lorem ipsum dolor sit amet consectetur
	adipisicing elit. Ullam error beatae rerum sunt magnam dolorum perferendis similique,
	aut quo possimus omnis deserunt animi amet impedit facilis dicta sapiente nam
	delectus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam error
	beatae rerum sunt magnam dolorum perferendis similique, aut quo possimus omnis
	deserunt animi amet impedit facilis dicta sapiente nam delectus. Lorem ipsum
	dolor sit amet consectetur adipisicing elit. Ullam error beatae rerum sunt magnam
	dolorum perferendis similique, aut quo possimus omnis deserunt animi amet impedit
	facilis dicta sapiente nam delectus.
</Modal>

<Modal bind:open={show2}>moin</Modal>

<h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
<a data-s href="https://kit.svelte.dev">kit.svelte.dev</a>
<br />
<br />
<br />
<input placeholder="your_mum@gmail.com" data-s /><br />
<input placeholder="your_mum@gmail.com" data-p /><br />
<input placeholder="your_mum@gmail.com" /><br /><br /><br />
<textarea placeholder="Hallo"> </textarea><br />
<textarea data-s placeholder="Hallo"> </textarea><br />
<textarea data-p placeholder="Hallo"> </textarea>
<br /><br /><br />
<button>Submit</button><br />
<button data-p on:click={() => (show2 = true)}> Submit</button><br />
<button data-s>Submit</button><br /><br /><br /><br />

<code>Wazup</code><br />
<code data-p>Wasup</code><br />
<code data-s>Wazup</code><br /><br /><br /><br />

Lorem <span>ipsum</span> dolor sit amet <strong>consectetur</strong> adipisicing
elit.
<b>Excepturi</b>
impedit corrupti <code data-p>doloremque</code>, error repudiandae amet, iusto
nesciunt consectetur voluptas fuga, nobis pariatur! Recusandae hic deleniti
expedita numquam iure ullam consequatur.<br /><br />
Lorem <span data-p>ipsum</span> dolor sit amet
<strong data-p>consectetur</strong>
adipisicing elit.
<b>Excepturi</b>
impedit corrupti <code>doloremque</code>, error repudiandae amet, iusto nesciunt
consectetur voluptas fuga, nobis pariatur! Recusandae hic deleniti expedita
numquam iure ullam consequatur.<br /><br />
Lorem <span data-s>ipsum</span> dolor sit amet
<strong data-s>consectetur</strong>
adipisicing elit.
<b>Excepturi</b>
impedit corrupti <code data-s>doloremque</code>, error repudiandae amet, iusto
nesciunt consectetur voluptas fuga, nobis pariatur! Recusandae hic deleniti
expedita numquam iure ullam consequatur.<br /><br /><br />
