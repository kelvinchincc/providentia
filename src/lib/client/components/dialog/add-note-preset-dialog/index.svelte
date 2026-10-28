<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import BaseDialog from '#lib/client/components/dialog/base-dialog/index.svelte';

	import { createForm } from '@tanstack/svelte-form';
	import type { Props } from './types';
	import { z } from 'zod';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { createAddNotePresetMutation } from '#lib/client/services/providentia/mutations/add-note-preset-mutation.js';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';
	import { dispatch } from '#lib/client/utils/timing.js';

	const { open, onClose }: Props = $props();
	const queryClient = useQueryClient();
	const addNotePresetsMutation = createAddNotePresetMutation();

	const form = createForm(() => ({
		defaultValues: {
			preset: ''
		},
		onSubmit: async ({ value }) => {
			try {
				await addNotePresetsMutation.mutateAsync({ content: value.preset });
				alert('Note preset added successfully!');
				dispatch(() => onClose());
			} catch (error) {
				console.error('Error adding note preset:', error);
				alert('Failed to add note preset. Please try again later.');
			} finally {
				dispatch(() =>
					queryClient.invalidateQueries({ queryKey: queryKeys.notePresets() })
				);
			}
		}
	}));

	$effect(() => {
		if (open) return;
		form.reset();
	});
</script>

<BaseDialog {open} {onClose}>
	<header class="mb-4">
		<h3 class="text-lg font-bold">Add Preset</h3>
	</header>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			form.handleSubmit();
		}}
	>
		<form.Field
			name="preset"
			validators={{ onSubmit: z.string().min(1, 'Preset cannot be empty') }}
		>
			{#snippet children({ state: { meta, value }, handleBlur, handleChange })}
				<label class="input w-full">
					<i class="fa-regular fa-note-sticky"></i>
					<input
						placeholder="Enter preset"
						onblur={handleBlur}
						onchange={(e) => handleChange((e.target as HTMLInputElement).value)}
						{value}
					/>
				</label>
				{#if meta.isTouched && meta.errors.length > 0}
					<p class="text-sm text-error">{meta.errors[0]?.message}</p>
				{/if}
			{/snippet}
		</form.Field>

		<section class="mt-4 flex justify-end gap-2">
			<button class="btn btn-secondary" type="button" onclick={onClose}>Cancel</button>
			<button class="btn btn-primary" type="submit">Add</button>
		</section>
	</form>
</BaseDialog>
