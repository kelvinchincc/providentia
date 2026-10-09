<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { cn } from '#lib/client/utils/cn.js';
	import BaseDialog from '../base-dialog/index.svelte';
	import type { Props } from './types';

	const { open, onClose, onCancel, onOk }: Props = $props();
</script>

<BaseDialog {open} onClose={() => onClose?.()}>
	<p>Hi</p>
	<footer class="dialog-footer mt-3 flex justify-end gap-2">
		{#if onCancel}
			<button class="btn btn-secondary" onclick={onCancel}>Cancel</button>
		{/if}
		<button class="btn w-20 btn-primary" onclick={onOk}>Ok</button>
	</footer>
</BaseDialog>
