<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		children: Snippet;
	};

	const { title, children }: Props = $props();
</script>

<section class="card bg-base-200 p-4 shadow-lg">
	<h2 class="mb-1 text-xl font-bold">{title}</h2>
	<div class="grid h-30 place-items-center">{@render children()}</div>
</section>
