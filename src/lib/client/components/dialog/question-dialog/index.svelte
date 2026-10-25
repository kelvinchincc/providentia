<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import BaseDialog from '../base-dialog/index.svelte';
	import type { Props } from './types';

	const { open, message, onClose, onYes, onNo, title }: Props = $props();
</script>

<BaseDialog {open} onClose={() => onClose?.()}>
	<header>
		<h3 class="text-lg font-bold">{title ?? 'Alert'}</h3>
	</header>
	<p class="py-4 whitespace-pre-wrap">{message}</p>
	<footer class="dialog-footer flex justify-end gap-2">
		<button
			class="btn w-20 btn-secondary"
			onclick={() => {
				onNo?.();
				onClose?.();
			}}
		>
			No
		</button>
		<button
			class="btn w-20 btn-primary"
			onclick={() => {
				onYes?.();
				onClose?.();
			}}
		>
			Yes
		</button>
	</footer>
</BaseDialog>
