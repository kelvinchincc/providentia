<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { createGemsOverviewQuery } from '#lib/client/services/providentia/query/gems-overview-query.js';
	import { GEM_UNIT } from '$app/env/public';

	const gemsOverviewQuery = createGemsOverviewQuery();
	const { data, isLoading, isRefetching, isError } = $derived(gemsOverviewQuery);
</script>

{#if isError}
	<div role="alert" class="alert alert-outline alert-error">
		<i class="fa-regular fa-circle-xmark"></i>
		Something went wrong when fetching overview, please try agian later!
	</div>
{:else}
	{#snippet stat(label: string, amount: number, description?: string)}
		<div class="tooltip min-w-0" data-tip={amount}>
			<div class="stats w-full cursor-default bg-base-200 shadow-lg select-none">
				<div class="stat min-w-0">
					<div class="stat-title">{label}</div>
					{#if isLoading || isRefetching}
						<div class="my-2 h-8 w-16 skeleton"></div>
					{:else}
						<div class="stat-value truncate overflow-hidden">
							{amount.toLocaleString()}
						</div>
					{/if}
					{#if description}
						<div class="stat-desc wrap-break-word whitespace-normal">{description}</div>
					{/if}
				</div>
			</div>
		</div>
	{/snippet}

	<section class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
		{@render stat(`Free ${GEM_UNIT}`, data?.free ?? 0, 'Earned from the game')}
		{@render stat(`Paid ${GEM_UNIT}`, data?.paid ?? 0, 'Purchased from store')}
		{@render stat(`Total ${GEM_UNIT}`, data?.total ?? 0, 'Total spendable')}
		{@render stat(`Pull Count`, data?.pullCount ?? 0, 'Total number of pulls')}
		{@render stat('Lenear Rewards', data?.linearAvg ?? 0, 'Login rewards')}
		{@render stat('30 Days Gain Average', data?.monthlyAvg ?? 0, 'Average 30 days gain')}
	</section>
{/if}
