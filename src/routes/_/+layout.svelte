<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import Header from '#lib/client/components/header.svelte';
	import { useAuthStore } from '#lib/client/store/authStore.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const props = $props();
	const authStore = useAuthStore();

	$effect(() => {
		if (authStore.current.username) return;

		goto(resolve('login'));
	});
</script>

<Header />
<div class="p-4">
	{@render props.children()}
</div>
