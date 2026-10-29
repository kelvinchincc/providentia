<script lang="ts">
	import GemsOverview from '#lib/client/components/gems-overview/index.svelte';
	import TargetCard from '#lib/client/components/target-card/index.svelte';
	import LogGemsDialog from '#lib/client/components/dialog/log-gems-dialog/index.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { GEM_UNIT } from '$app/env/public';
	import { createListForcastsQuery } from '#lib/client/services/providentia/query/list-forcasts-query.js';

	const listForcastsQuery = createListForcastsQuery();
	const forcastData = $derived(listForcastsQuery.data ?? []);

	// const mockedForcast = [
	// 	{
	// 		id: 1,
	// 		name: 'Forcast 1',
	// 		createdAt: '2024-06-01',
	// 		updatedAt: '2024-06-01',
	// 		createdBy: 'User 1',
	// 		updatedBy: 'User 1',
	// 		expectedGemsLinear: 145005,
	// 		expectedGemsBasic: 135760,
	// 		targetDate: '2024-06-30'
	// 	},
	// 	{
	// 		id: 2,
	// 		name: 'Forcast 2',
	// 		createdAt: '2024-06-02',
	// 		updatedAt: '2024-06-02',
	// 		createdBy: 'User 2',
	// 		updatedBy: 'User 2',
	// 		expectedGemsLinear: 150000,
	// 		expectedGemsBasic: 140000,
	// 		targetDate: '2024-07-15'
	// 	},
	// 	{
	// 		id: 3,
	// 		name: 'Forcast 3',
	// 		createdAt: '2024-06-03',
	// 		updatedAt: '2024-06-03',
	// 		createdBy: 'User 3',
	// 		updatedBy: 'User 3',
	// 		expectedGemsLinear: 155000,
	// 		expectedGemsBasic: 145000,
	// 		targetDate: '2024-07-30'
	// 	}
	// ];

	let logGemsDialogOpen = $state(false);

	function onAddForcast() {
		// TODO: Implement the logic to add a new forcast
		alert('Comming Soon!');
	}

	function onObtainHistoryClicked() {
		goto(resolve('/_/obtain-history'));
	}
</script>

<main>
	<LogGemsDialog open={logGemsDialogOpen} onClose={() => (logGemsDialogOpen = false)} />

	<div class="mb-4">
		<GemsOverview />
	</div>

	<section id="forcast">
		<section class="flex items-center justify-end gap-2">
			<button class="btn btn-primary" onclick={onAddForcast}>
				<i class="fa-solid fa-plus"></i>
				Add forcast
			</button>
			<button class="btn btn-primary" onclick={() => (logGemsDialogOpen = true)}>
				<i class="fa-solid fa-pen-to-square"></i>
				Log {GEM_UNIT}
			</button>
			<button class="btn btn-primary" onclick={onObtainHistoryClicked}>
				<i class="fa-solid fa-clock-rotate-left"></i>
				Obtain history
			</button>
		</section>

		<section class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
			{#each forcastData as item (item.id)}
				<TargetCard
					item={{
						id: item.id,
						createdAt: item.createdAt,
						updatedAt: item.updatedAt,
						expectedGemsMonthlyAvg: item.monthlyAverage,
						expectedGemsLinear: item.linearAverage,
						name: item.name,
						targetDate: item.targetDate
					}}
				/>
			{/each}
		</section>
	</section>
</main>
