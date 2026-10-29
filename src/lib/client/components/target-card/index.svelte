<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { formatDate } from '#lib/client/utils/display.js';
	import type { Props } from './types';

	const { item }: Props = $props();
</script>

{#snippet field(label: string, value: string)}
	<div>{label}</div>
	<div class="text-right">{value}</div>
{/snippet}

<section class="card rounded-lg bg-base-200 p-4">
	<header class="mb-2 flex items-center justify-between">
		<h2 class="bold text-xl">{item.name}</h2>
		<button class="btn btn-square btn-error" aria-label="Remove Forcast">
			<i class="fa-solid fa-trash"></i>
		</button>
	</header>
	<section class="grid grid-cols-[auto_auto] gap-1">
		{@render field('Target Date', formatDate(item.targetDate))}
		{@render field('Linear Gain', item.expectedGemsLinear.toLocaleString())}
		{@render field('30 Days Average Gain', item.expectedGemsMonthlyAvg.toLocaleString())}
	</section>
</section>
