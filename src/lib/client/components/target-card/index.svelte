<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import EditForecastDialog from '#lib/client/components/dialog/edit-forecast-dialog/index.svelte';

	import { cn } from '#lib/client/utils/cn.js';
	import { formatDate } from '#lib/client/utils/display.js';
	import type { ForecastTargetHit } from '#lib/schema/api/get-forecasts.js';
	import type { Props } from './types';
	import { GEM_UNIT } from '$app/env/public';
	import { createDeleteForecastMutation } from '#lib/client/services/providentia/mutations/delete-forecast-mutation.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';

	const { item }: Props = $props();
	const queryClient = useQueryClient();

	const textColourMap: Record<ForecastTargetHit, string> = {
		no: 'text-error',
		hit: 'text-warning',
		safe: 'text-success'
	};

	const deleteForecastMutation = createDeleteForecastMutation();

	let editForecastDialogOpen = $state(false);

	async function handleDeleteForecast(forecastId: string) {
		const confirmDelete = confirm(
			'Are you sure you want to delete this forecast? This action cannot be undone.'
		);
		if (!confirmDelete) return;

		try {
			await deleteForecastMutation.mutateAsync(forecastId);
		} catch (error) {
			console.error('Error deleting forecast:', error);
			alert('Failed to delete forecast. Please try again.');
		} finally {
			queryClient.invalidateQueries({ queryKey: queryKeys.forecasts() });
		}
	}

	function handleEditForecast() {
		editForecastDialogOpen = true;
	}
</script>

{#snippet field(label: string, value: string, className: string = '')}
	<div>{label}</div>
	<div class={cn('text-right', className)}>{value}</div>
{/snippet}

<EditForecastDialog
	open={editForecastDialogOpen}
	onClose={() => (editForecastDialogOpen = false)}
	forecastId={item.id}
	forecastName={item.name}
	targetDate={item.targetDate}
/>

<section class="tooltip card flex flex-col rounded-lg bg-base-200 p-4" data-tip={item.name}>
	<header class="mb-2 flex items-center justify-between">
		<h2 class="bold overflow-hidden text-xl text-nowrap text-ellipsis">{item.name}</h2>
		<div class="ml-2 flex flex-row gap-1">
			<button
				class="btn btn-square btn-secondary"
				aria-label="Edit Forecast"
				onclick={handleEditForecast}
			>
				<i class="fa-solid fa-pen-to-square"></i>
			</button>
			<button
				class="btn btn-square btn-error"
				aria-label="Remove Forecast"
				onclick={() => handleDeleteForecast(item.id)}
			>
				<i class="fa-solid fa-trash"></i>
			</button>
		</div>
	</header>
	<section class="grid grid-cols-[auto_auto] gap-1">
		{@render field('Target Date', formatDate(item.targetDate))}
		{@render field(`Needed ${GEM_UNIT}`, item.targetAmount.toLocaleString())}
		{@render field('Needed Pulls', item.targetPull.toLocaleString())}

		<section class="col-start-1 -col-end-1">
			<h3 class="bold mt-2 text-lg">Linear Forecast</h3>
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
			<h3 class="bold text-lg">Monthly Average Forecast</h3>
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
