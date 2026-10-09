<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { dialogStoreActions, useDialogStore } from '#lib/client/store/genericDialogStore.js';
	import AlertDialog from '#lib/client/components/dialog/alert-dialog/index.svelte';

	let { children } = $props();

	const dialogStore = useDialogStore();
	const queryClient = new QueryClient();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="m-0 min-h-screen bg-base-300 p-0">
	<QueryClientProvider client={queryClient}>
		<AlertDialog
			open={dialogStore.current.open}
			message={dialogStore.current.message}
			onOk={dialogStore.current.onOk}
			onClose={dialogStoreActions.handleClose}
			onCancel={dialogStore.current.onCancel}
			title={dialogStore.current.title}
		/>
		{@render children()}
		<SvelteQueryDevtools />
	</QueryClientProvider>
</div>
