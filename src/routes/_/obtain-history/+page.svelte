<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { createGemsHistoryQuery } from '#lib/client/services/providentia/query/gems-history-query.js';

	const gemsHistoryQuery = createGemsHistoryQuery({ limit: 1 });

	$effect(() => {
		console.log(gemsHistoryQuery.data);
	});
</script>

<section class="mx-auto w-200">
	<div class="rounded-lg border border-base-content/5">
		{#if gemsHistoryQuery.isSuccess}
			<table class="table">
				<thead>
					<tr>
						<th class="w-10 max-w-20"></th>
						<th class="w-15">Amount</th>
						<th class="w-45">Obtained At</th>
						<th class="w-45">Updated At</th>
						<th class="w-15">Type</th>
						<th class="">Note</th>
					</tr>
				</thead>
				<tbody>
					{#each gemsHistoryQuery.data.pages as data (data?.next || '00000000-0000-0000-0000-000000000000')}
						<tr>
							{#each data?.list as item (item.id)}
								<td>1</td>
								<td>{item.amount}</td>
								<td>{item.obtainedAt}</td>
								<td>{item.updatedAt}</td>
								<td>{item.type}</td>
								<td>{item.note}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<button
		class="btn mt-2 btn-ghost"
		disabled={gemsHistoryQuery.isFetchingNextPage || !gemsHistoryQuery.hasNextPage}
		onclick={() => gemsHistoryQuery.fetchNextPage()}
	>
		<i class="fa-solid fa-chevron-down"></i>
		Load More...
	</button>
</section>
