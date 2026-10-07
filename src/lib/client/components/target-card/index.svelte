<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import type { Props } from './types';

	const { item }: Props = $props();
</script>

{#snippet field(label: string, value: string)}
	<div>{label}</div>
	<div class="text-right">{value}</div>
{/snippet}

<section class="card rounded-lg bg-base-200 p-4">
	<h2 class="bold mb-2 text-xl">{item.name}</h2>
	<section class="grid grid-cols-[auto_auto] gap-1">
		{@render field('Target Date', item.targetDate)}
		{@render field('Basic Expected', item.expectedGemsBasic.toLocaleString())}
		{@render field('Average Gain Expected', item.expectedGemsLinear.toLocaleString())}
	</section>
</section>
