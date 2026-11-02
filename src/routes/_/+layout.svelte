<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import Footer from '#lib/client/components/footer.svelte';
	import Header from '#lib/client/components/header.svelte';
	import { useAuthStore } from '#lib/client/store/authStore.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	const props = $props();
	const authStore = useAuthStore();

	async function detectServiceWorkerUpdate() {
		const registration = await navigator.serviceWorker.ready;

		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing;
			newWorker?.addEventListener('statechange', () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					const confrim = confirm(
						'A new version of the app is available. Do you want to update now?'
					);
					if (confrim) {
						newWorker.postMessage({ type: 'SKIP_WAITING' });
						window.location.reload();
					}
				}
			});
		});
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
