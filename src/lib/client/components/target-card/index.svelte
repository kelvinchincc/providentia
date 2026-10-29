<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { cn } from '#lib/client/utils/cn.js';
	import { formatDate } from '#lib/client/utils/display.js';
	import type { ForcastTargetHit } from '#lib/schema/api/get-forcasts.js';
	import type { Props } from './types';
	import { GEM_UNIT } from '$app/env/public';

	const { item }: Props = $props();

	const textColourMap: Record<ForcastTargetHit, string> = {
		no: 'text-error',
		hit: 'text-warning',
		safe: 'text-success'
	};
</script>

{#snippet field(label: string, value: string, className: string = '')}
	<div>{label}</div>
	<div class={cn('text-right', className)}>{value}</div>
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
		{@render field(`Needed ${GEM_UNIT}`, item.targetAmount.toLocaleString())}
		{@render field('Needed Pulls', item.targetPull.toLocaleString())}

		<section class="col-start-1 -col-end-1">
			<h3 class="bold mt-2 text-lg">Linear Forcast</h3>
			<div class="ml-4 grid grid-cols-[auto_auto] gap-1">
				{@render field(
					'Amount',
					item.expected.linear.amount.toLocaleString(),
					textColourMap[item.expected.linear.targetHit]
				)}
				{@render field(
					'Total Pull',
					item.expected.linear.pull.toLocaleString(),
					textColourMap[item.expected.linear.targetHit]
				)}
			</div>
		</section>

		<section class="col-start-1 -col-end-1 mt-2">
			<h3 class="bold text-lg">Monthly Average Forcast</h3>
			<div class="ml-4 grid grid-cols-[auto_auto] gap-1">
				{@render field(
					'Amount',
					item.expected.monthlyAvg.amount.toLocaleString(),
					textColourMap[item.expected.monthlyAvg.targetHit]
				)}
				{@render field(
					'Total Pull',
					item.expected.monthlyAvg.pull.toLocaleString(),
					textColourMap[item.expected.monthlyAvg.targetHit]
				)}
			</div>
		</section>
	</section>
</section>
