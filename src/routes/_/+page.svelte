<script lang="ts">
	import GemsOverview from '#lib/client/components/gems-overview/index.svelte';

	const mockedGems = {
		total: 136060,
		paid: 300,
		free: 135760
	};
</script>

<main>
	<div class="mb-4 max-w-[min(100%,800px)]">
		<GemsOverview total={mockedGems.total} free={mockedGems.free} paid={mockedGems.paid} />
	</div>

	<section id="forcast">
		<section class="flex items-center justify-end">
			<button class="btn btn-primary">
				<i class="fa-solid fa-plus"></i>
				Add forcast
			</button>
		</section>
	</section>
</main>
