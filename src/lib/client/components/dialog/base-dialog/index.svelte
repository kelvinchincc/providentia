<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { cn } from '#lib/client/utils/cn.js';
	import { onMount } from 'svelte';
	import type { Props } from './types';

	const { open, onClose, class: className, children }: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open) {
			dialog.showModal();
		} else {
			onClose?.();
			dialog.close();
		}
	});

	onMount(() => {
		// block escape key down event from closing the dialog
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
			}
		};

		dialog.addEventListener('keydown', handleKeyDown);

		return () => {
			dialog.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<dialog bind:this={dialog} class="modal" oncancel={(event) => event.preventDefault()}>
	<section class={cn('modal-box', className)}>{@render children()}</section>
</dialog>
