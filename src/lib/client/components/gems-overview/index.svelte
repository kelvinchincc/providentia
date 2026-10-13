<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import type { Props } from './types';
	import { GEM_UNIT } from '$app/env/public';

	const props: Props = $props();
</script>

{#snippet stat(label: string, amount: number, description?: string)}
	<div class="tooltip min-w-0" data-tip={amount}>
		<div class="stats w-full cursor-default bg-base-200 shadow-lg select-none">
			<div class="stat min-w-0">
				<div class="stat-title">{label}</div>
				<div class="stat-value truncate overflow-hidden">{amount.toLocaleString()}</div>
				{#if description}
					<div class="stat-desc wrap-break-word whitespace-normal">{description}</div>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<section class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
	{@render stat(`Free ${GEM_UNIT}`, props.free, 'Earned from the game')}
	{@render stat(`Paid ${GEM_UNIT}`, props.paid, 'Purchased from store')}
	{@render stat(`Total ${GEM_UNIT}`, props.total, 'Total spendable')}
	{@render stat('Lenear Rewards', 1, 'Login rewards')}
	{@render stat('30 Days Gain Average', 2, 'Average 30 days gain')}
</section>
