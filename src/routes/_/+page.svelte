<script lang="ts">
	import GemsOverview from '#lib/client/components/gems-overview/index.svelte';
	import TargetCard from '#lib/client/components/target-card/index.svelte';
	import LogGemsDialog from '#lib/client/components/dialog/log-gems-dialog/index.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { GEM_UNIT } from '$app/env/public';
	import { createListForecastsQuery } from '#lib/client/services/providentia/query/list-forecasts-query.js';

	const listForecastsQuery = createListForecastsQuery();
	const forecastData = $derived(listForecastsQuery.data ?? []);

	// const mockedForecast = [
	// 	{
	// 		id: 1,
	// 		name: 'Forecast 1',
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
	// 		name: 'Forecast 2',
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
	// 		name: 'Forecast 3',
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

	function onAddForecast() {
		// TODO: Implement the logic to add a new forecast
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

	<section id="forecast">
		<section class="flex items-center justify-end gap-2">
			<button class="btn btn-primary" onclick={onAddForecast}>
				<i class="fa-solid fa-plus"></i>
				Add forecast
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

		{#if listForecastsQuery.isFetching}
			<div class="mt-4 grid place-items-center">
				<div class="loading loading-xl loading-spinner"></div>
			</div>
		{:else if listForecastsQuery.isError}
			<div class="mt-4 alert alert-outline alert-error">
				<i class="fa-regular fa-circle-xmark"></i>
				<span>Opps! Something went wrong!</span>
			</div>
		{:else if forecastData.length <= 0}
			<div class="mt-4 alert">
				<i class="fa-solid fa-circle-info"></i>
				<span>No forecast created, click "Add forecast" to create one.</span>
			</div>
		{:else}
			<section class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
				{#each forecastData as item (item.id)}
					<TargetCard {item} />
				{/each}
			</section>
		{/if}
	</section>
</main>
