<script lang="ts">
	import { removeToast, type Toast } from '../routes/toast';
	export let t: Toast;
	setTimeout(() => removeToast(t.id), 5600);
</script>

<div class:error={t.error == true} class:success={t.error == false}>
	{t.message}
</div>

<style>
	.error {
		color: var(--p);
	}
	.success {
		color: var(--s);
	}

	div {
		user-select: none;
		width: 200px;
		background-image: linear-gradient(
			90deg,
			var(--bgt) 50%,
			var(--bgat) 50%
		);
		outline: 1px solid var(--bga);
		background-size: 200% 100%;
		border-radius: 5px;
		padding: 10px;
		margin: 5px;
		height: fit-content;
		color: var(--t);
		backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
		animation:
			slideIn 0.5s linear forwards,
			slideOut 0.5s 5s linear forwards,
			bg 5s linear forwards;
		overflow: hidden;
		transition: all 0.5s linear;
	}
	@keyframes bg {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -100% 0;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(100%);
		}
		to {
			opacity: 1;
			transform: translateY(0%);
		}
	}
	@keyframes slideOut {
		to {
			max-height: 0px;
			margin: 0;
			padding: 0;
			opacity: 0;
			transform: translateX(200%);
		}
	}
</style>
