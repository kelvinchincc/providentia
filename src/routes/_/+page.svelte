<script lang="ts">
	import AlertDialog from '#lib/client/components/dialog/alert-dialog/index.svelte';
	import GemsOverview from '#lib/client/components/gems-overview/index.svelte';
	import TargetCard from '#lib/client/components/target-card/index.svelte';

	const mockedGems = {
		total: 136060,
		paid: 300,
		free: 135760
	};

	const mockedForcast = [
		{
			id: 1,
			name: 'Forcast 1',
			createdAt: '2024-06-01',
			updatedAt: '2024-06-01',
			createdBy: 'User 1',
			updatedBy: 'User 1',
			expectedGemsLinear: 145005,
			expectedGemsBasic: 135760,
			targetDate: '2024-06-30'
		},
		{
			id: 2,
			name: 'Forcast 2',
			createdAt: '2024-06-02',
			updatedAt: '2024-06-02',
			createdBy: 'User 2',
			updatedBy: 'User 2',
			expectedGemsLinear: 150000,
			expectedGemsBasic: 140000,
			targetDate: '2024-07-15'
		},
		{
			id: 3,
			name: 'Forcast 3',
			createdAt: '2024-06-03',
			updatedAt: '2024-06-03',
			createdBy: 'User 3',
			updatedBy: 'User 3',
			expectedGemsLinear: 155000,
			expectedGemsBasic: 145000,
			targetDate: '2024-07-30'
		}
	];
</script>

<main>
	<div class="mb-4 max-w-[min(100%,800px)]">
		<GemsOverview total={mockedGems.total} free={mockedGems.free} paid={mockedGems.paid} />
	</div>

	<section id="forcast">
		<section class="flex items-center justify-end gap-2">
			<button class="btn btn-primary">
				<i class="fa-solid fa-plus"></i>
				Add forcast
			</button>
			<button class="btn btn-primary">
				<i class="fa-solid fa-pen-to-square"></i>
				Log Gems
			</button>
			<button class="btn btn-primary">
				<i class="fa-solid fa-clock-rotate-left"></i>
				Obtain history
			</button>
		</section>

		<section class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
			{#each mockedForcast as item (item.id)}
				<TargetCard {item} />
			{/each}
		</section>
	</section>
</main>
