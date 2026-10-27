<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import LogGemsDialog from '#lib/client/components/dialog/log-gems-dialog/index.svelte';
	import EditGemsDialog from '#lib/client/components/dialog/edit-gems-dialog/index.svelte';

	import { createGemsHistoryQuery } from '#lib/client/services/providentia/query/gems-history-query.js';
	import { formatDateTime, formatGemType } from '#lib/client/utils/display.js';
	import { GEM_UNIT } from '$app/env/public';
	import { cn } from '#lib/client/utils/cn.js';
	import { createDeleteGemsMutation } from '#lib/client/services/providentia/mutations/delete-gems-mutation.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { dispatch } from '#lib/client/utils/timing.js';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';
	import { NULL_UUID } from '#lib/constants/values.js';
	import type { GemRecord } from '#lib/client/components/dialog/edit-gems-dialog/types.js';

	const LIMIT = 25;

	const queryClient = useQueryClient();
	const gemsHistoryQuery = createGemsHistoryQuery({ limit: LIMIT });
	const deleteGemsMutation = createDeleteGemsMutation();

	let isLogGemsDialogOpen = $state(false);
	let isEditGemsDialogOpen = $state(false);
	let gemRecordToEdit = $state<GemRecord | null>(null);

	$effect(() => {
		console.log(gemsHistoryQuery.data);
	});

	async function onDeleteGemRecord(recId: string) {
		let result = confirm('Are you sure to delete this record? This action cannot be undone.');

		if (!result) return;
		try {
			await deleteGemsMutation.mutateAsync(recId);
			alert('Record deleted successfully!');
		} catch (error) {
			console.error('Error deleting gem record:', error);
			alert('Unable to delete record. Please try again later.');
		} finally {
			dispatch(() => {
				queryClient.invalidateQueries({ queryKey: queryKeys.gemHistory() });
				queryClient.invalidateQueries({ queryKey: queryKeys.gemsOverview() });
			});
		}
	}
</script>

<LogGemsDialog open={isLogGemsDialogOpen} onClose={() => (isLogGemsDialogOpen = false)} />
<EditGemsDialog
	open={isEditGemsDialogOpen}
	recordToEdit={gemRecordToEdit}
	onClose={() => (isEditGemsDialogOpen = false)}
/>

<section class="mx-auto w-200">
	{#if gemsHistoryQuery.isError}
		<div role="alert" class="alert alert-outline alert-error">
			<i class="fa-solid fa-triangle-exclamation"></i>
			<span>{gemsHistoryQuery.error.message}</span>
		</div>
	{/if}
	{#if gemsHistoryQuery.isSuccess}
		<div class="rounded-lg border border-base-content/5">
			<table class="table">
				<thead>
					<tr>
						<th class="w-10 max-w-20"></th>
						<th class="w-15">Amount</th>
						<th class="w-45">Obtained At</th>
						<th class="w-45">Updated At</th>
						<th class="w-15">Type</th>
						<th class="min-w-50">Note</th>
						<th class=""></th>
					</tr>
				</thead>
				<tbody>
					{#if gemsHistoryQuery.data.pages[0]?.list.length === 0}
						<tr>
							<td colspan="6" class="text-center">
								<i class="fa-solid fa-ban"></i>
								No data
							</td>
						</tr>
					{/if}
					{#each gemsHistoryQuery.data.pages as data, bulkIndex (data?.next || NULL_UUID)}
						{#each data?.list as item, itemIndex (item.id)}
							<tr>
								<td>{bulkIndex * LIMIT + itemIndex + 1}</td>
								<td class={cn('text-right', { 'text-error': item.amount < 0 })}
									>{item.amount}</td
								>
								<td>{formatDateTime(item.obtainedAt)}</td>
								<td>{formatDateTime(item.updatedAt)}</td>
								<td>{formatGemType(item.type)}</td>
								<td>{item.note || '-'}</td>
								<td>
									<div class="flex gap-2">
										<button
											class="btn btn-square btn-secondary"
											aria-label="Edit"
											onclick={() => {
												gemRecordToEdit = {
													id: item.id,
													amount: item.amount,
													note: item.note,
													type: item.type
												};
												isEditGemsDialogOpen = true;
											}}
										>
											<i class="fa-solid fa-pen-to-square"></i>
										</button>
										<button
											class="btn btn-square btn-error"
											aria-label="Delete"
											onclick={() => onDeleteGemRecord(item.id)}
										>
											<i class="fa-solid fa-trash"></i>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<footer class="relative mt-2 h-10">
		{#if gemsHistoryQuery.isSuccess}
			<button
				class="btn float-left btn-ghost"
				disabled={gemsHistoryQuery.isFetchingNextPage || !gemsHistoryQuery.hasNextPage}
				onclick={() => gemsHistoryQuery.fetchNextPage()}
			>
				<i class="fa-solid fa-chevron-down"></i>
				Load More...
			</button>
			<button
				class="btn float-right btn-primary"
				onclick={() => (isLogGemsDialogOpen = true)}
			>
				<i class="fa-solid fa-pen-to-square"></i>
				Log {GEM_UNIT}
			</button>
		{/if}
		{#if gemsHistoryQuery.isFetching}
			<div class="absolute inset-0 grid place-items-center">
				<div class="loading loading-xl loading-dots"></div>
			</div>
		{/if}
	</footer>
</section>
