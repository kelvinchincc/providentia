<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import Footer from '#lib/client/components/footer.svelte';
	import Header from '#lib/client/components/header.svelte';
	import { useAuthStore } from '#lib/client/store/authStore.js';
	import { cn } from '#lib/client/utils/cn.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	const props = $props();
	const authStore = useAuthStore();

	/** Waiting service worker to offer, or `null` when the banner is hidden. */
	let waitingWorker = $state<ServiceWorker | null>(null);

	/**
	 * Watches for service worker updates. Offers the waiting worker through the banner and
	 * re-offers it on tab focus, so a dismissed banner comes back without a reload.
	 *
	 * @throws {Error} When service workers are not supported (`navigator.serviceWorker` missing).
	 */
	async function detectServiceWorkerUpdate() {
		const registration = await navigator.serviceWorker.ready;

		const offerUpdate = () => {
			if (registration.waiting && navigator.serviceWorker.controller) {
				waitingWorker = registration.waiting;
			}
		};

		registration.addEventListener('updatefound', () => {
			registration.installing?.addEventListener('statechange', offerUpdate);
		});

		document.addEventListener('visibilitychange', () => {
			if (!document.hidden) offerUpdate();
		});

		offerUpdate();
	}

	/**
	 * Activates the waiting service worker and reloads once it takes control.
	 */
	function applyUpdate() {
		if (!waitingWorker) return;

		navigator.serviceWorker.addEventListener(
			'controllerchange',
			() => window.location.reload(),
			{
				once: true
			}
		);
		waitingWorker.postMessage({ type: 'SKIP_WAITING' });
		waitingWorker = null;
	}

	$effect(() => {
		if (authStore.current.username) return;

		goto(resolve('login'));
	});

	onMount(() => {
		detectServiceWorkerUpdate();
	});
</script>

<section class="grid min-h-dvh grid-rows-[auto_1fr_auto]">
	<Header />
	<div class="p-4">
		{@render props.children()}
	</div>
	<Footer />
</section>

{#if waitingWorker}
	<div
		role="status"
		class={cn(
			'alert alert-soft alert-info',
			'fixed z-50 flex items-center justify-between gap-4 rounded-lg border p-4 shadow-xl',
			'right-4 bottom-4 left-4 mx-auto w-[min(80vw,600px)]'
		)}
	>
		<p class="text-sm">
			<i class="fa-solid fa-circle-info"></i>
			A new version of the app is available.
		</p>
		<div class="flex gap-2">
			<button
				type="button"
				class="btn btn-ghost text-base-content btn-sm"
				onclick={() => (waitingWorker = null)}
			>
				Later
			</button>
			<button type="button" class="btn btn-primary btn-sm" onclick={applyUpdate}>
				Update
			</button>
		</div>
	</div>
{/if}
