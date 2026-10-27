<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { createNotePresetsQuery } from '#lib/client/services/providentia/query/note-presets-query.js';
	import { cn } from '#lib/client/utils/cn.js';
	import SectionCard from './SectionCard.svelte';

	const notePresetsQuery = createNotePresetsQuery();
	const notePresets = $derived(notePresetsQuery.data ?? []);
</script>

<main class="mx-auto flex max-w-[min(80vw,500px)] flex-col gap-3">
	<h1 class="text-2xl font-bold">Profile</h1>
	<SectionCard title="User Info">
		<div class="grid h-30 place-items-center">
			<div>🏗️ Under construction</div>
		</div>
	</SectionCard>

	<SectionCard title="Note Presets">
		{#if notePresetsQuery.isError}
			<div class="mt-3 alert alert-outline alert-error">Opps! something went wrong!</div>
		{:else if notePresetsQuery.isFetching}
			<div class="grid h-30 place-items-center">
				<div class="loading loading-xl loading-spinner"></div>
			</div>
		{:else}
			<section class="flex flex-col gap-2">
				{#each notePresets as preset (preset.id)}
					<div
						class={cn(
							'flex flex-row items-center justify-between gap-2 rounded-lg border border-neutral',
							'p-2 px-3'
						)}
					>
						<div class="font-bold">{preset.tag}</div>
						<section>
							<button class="btn btn-square btn-secondary" aria-label="Edit">
								<i class="fa-solid fa-pen-to-square"></i>
							</button>
							<button class="btn btn-square btn-error" aria-label="Delete">
								<i class="fa-solid fa-trash"></i>
							</button>
						</section>
					</div>
				{/each}
				<button class="btn btn-primary">
					<i class="fa-solid fa-plus"></i>
					Add
				</button>
			</section>
		{/if}
	</SectionCard>
</main>
