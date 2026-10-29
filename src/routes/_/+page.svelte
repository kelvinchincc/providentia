<script lang="ts">
	import GemsOverview from '#lib/client/components/gems-overview/index.svelte';
	import TargetCard from '#lib/client/components/target-card/index.svelte';
	import LogGemsDialog from '#lib/client/components/dialog/log-gems-dialog/index.svelte';
	import AddForecastDialog from '#lib/client/components/dialog/add-forecast-dialog/index.svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { GEM_UNIT } from '$app/env/public';
	import { createListForecastsQuery } from '#lib/client/services/providentia/query/list-forecasts-query.js';

	const listForecastsQuery = createListForecastsQuery();
	const forecastData = $derived(listForecastsQuery.data ?? []);

	let logGemsDialogOpen = $state(false);
	let addForecastDialogOpen = $state(false);

	function onAddForecast() {
		addForecastDialogOpen = true;
	}

	function onObtainHistoryClicked() {
		goto(resolve('/_/obtain-history'));
	}
</script>

<main>
	<LogGemsDialog open={logGemsDialogOpen} onClose={() => (logGemsDialogOpen = false)} />
	<AddForecastDialog
		open={addForecastDialogOpen}
		onClose={() => (addForecastDialogOpen = false)}
	/>

	<div class="mb-4">
		<GemsOverview />
	</div>

	<section id="forecast" class="pt-4">
		<h1 class="text-2xl">Forecast</h1>

		<!-- Mobile menu -->
		<div class="flex flex-row justify-end md:hidden">
			<details class="dropdown dropdown-end">
				<summary class="btn m-1 btn-square btn-primary" aria-label="Actions">
					<i class="fa-solid fa-caret-down text-lg"></i>
				</summary>
				<ul
					class="mt-.5 menu dropdown-content z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm"
				>
					<li>
						<button onclick={onAddForecast}>
							<i class="fa-solid fa-plus"></i>
							Add forecast
						</button>
					</li>
					<li>
						<button onclick={() => (logGemsDialogOpen = true)}>
							<i class="fa-solid fa-pen-to-square"></i>
							Log {GEM_UNIT}
						</button>
					</li>
					<li>
						<button onclick={onObtainHistoryClicked}>
							<i class="fa-solid fa-clock-rotate-left"></i>
							Obtain history
						</button>
					</li>
				</ul>
			</details>
		</div>

		<!-- Desktop menu -->
		<section class="hidden items-center justify-end gap-2 md:flex">
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
