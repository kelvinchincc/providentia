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

{#snippet stat(label: string, amount: number, tooltip?: string)}
	<div class="tooltip" data-tip={tooltip ?? amount}>
		<div class="stats w-full cursor-default bg-base-200 shadow-lg select-none">
			<div class="stat">
				<div class="stat-title">{label}</div>
				<div class="stat-value truncate overflow-hidden">{amount.toLocaleString()}</div>
			</div>
		</div>
	</div>
{/snippet}

<section class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
	{@render stat(`Free ${GEM_UNIT}`, props.free)}
	{@render stat(`Paid ${GEM_UNIT}`, props.paid)}
	{@render stat(`Total ${GEM_UNIT}`, props.total)}
	{@render stat('Lenear Rewards', 1, 'Garunteed rewards, eg from login rewards or weekly quests')}
	{@render stat(
		'30 Days Gain Average',
		2,
		'Average gain over the last 30 days, eg from quests, events, and other sources'
	)}
</section>
