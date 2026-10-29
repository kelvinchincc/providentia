<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import BaseDialog from '#lib/client/components/dialog/base-dialog/index.svelte';

	import { createForm } from '@tanstack/svelte-form';
	import type { Props } from './types';
	import { createDefaultFormSchema, updateGemFormSchema } from '#lib/schema/api/update-gem.js';
	import { cn } from '#lib/client/utils/cn.js';
	import { GemType } from '#lib/constants/gem-type.js';
	import { createUpdateGemsMutation } from '#lib/client/services/providentia/mutations/update-gems-mutation.js';
	import { dispatch } from '#lib/client/utils/timing.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';
	import { createNotePresetsQuery } from '#lib/client/services/providentia/query/note-presets-query.js';
	import { resolve } from '$app/paths';

	const { onClose, open, recordToEdit }: Props = $props();
	const queryClient = useQueryClient();
	const notePresetsQuery = createNotePresetsQuery();
	const updateGemMutation = createUpdateGemsMutation();
	const form = createForm(() => ({
		defaultValues: createDefaultFormSchema(),
		validators: {
			onSubmit: updateGemFormSchema
		},
		onSubmit: async ({ value }) => {
			if (recordToEdit == null) {
				throw new Error('No record to edit');
			}

			try {
				await updateGemMutation.mutateAsync({
					id: recordToEdit.id,
					...value
				});
				onClose();
			} catch (error) {
				console.error('Error updating gem record:', error);
				alert('Unable to update gem record. Please try again later.');
			} finally {
				dispatch(() => {
					queryClient.invalidateQueries({ queryKey: queryKeys.gemHistory() });
					queryClient.invalidateQueries({ queryKey: queryKeys.gemsOverview() });
					queryClient.invalidateQueries({ queryKey: queryKeys.forecasts() });
				});
			}
		}
	}));

	const presets = notePresetsQuery.data ?? [];

	$effect(() => {
		const newValues =
			recordToEdit == null
				? undefined
				: ({
						amount: recordToEdit.amount.toString(),
						type: recordToEdit.type,
						note: recordToEdit.note
					} as Parameters<typeof form.reset>[0]);
		form.reset(newValues);
	});
</script>

<BaseDialog {open} {onClose}>
	<header class="mb-4">
		<h3 class="text-lg font-bold">Log Gems</h3>
	</header>

	<form
		class="flex flex-col gap-3"
		onsubmit={(e) => {
			e.preventDefault();
			form.handleSubmit();
		}}
	>
		<form.Field name="amount">
			{#snippet children({ state: { value, meta }, handleChange, handleBlur })}
				<div>
					<label class={cn('input w-full', { 'border-error': meta.errors.length > 0 })}>
						<i class="fa-regular fa-gem min-w-7"></i>
						<input
							type="text"
							{value}
							onchange={(e) => handleChange(e.currentTarget.value)}
							onblur={handleBlur}
							placeholder="Current Amount"
						/>
					</label>
					{#if meta.errors}
						<div class="text-right text-xs text-error">
							{meta.errors[0]?.message}
						</div>
					{/if}
				</div>
			{/snippet}
		</form.Field>
		<form.Field name="type">
			{#snippet children({ state: { value, meta }, handleChange, handleBlur })}
				<div>
					<label class={cn('select w-full', { 'border-error': !!meta.errors.length })}>
						<i class="fa-solid fa-tag min-w-7"></i>
						<select
							{value}
							onchange={(e) => {
								handleChange(e.currentTarget.value as typeof value);
							}}
							onblur={handleBlur}
						>
							<option value={GemType.FREE}>Free</option>
							<option value={GemType.PAID}>Paid</option>
						</select>
					</label>
					{#if meta.errors}
						<div class="text-right text-xs text-error">
							{meta.errors[0]?.message}
						</div>
					{/if}
				</div>
			{/snippet}
		</form.Field>
		<form.Field name="note">
			{#snippet children({ state: { value, meta }, handleChange, handleBlur })}
				<div>
					<label class={cn('input w-full', { 'border-error': !!meta.errors.length })}>
						<i class="fa-regular fa-clipboard min-w-7"></i>
						<input
							type="text"
							{value}
							onblur={handleBlur}
							onchange={(e) => handleChange(e.currentTarget.value)}
							placeholder="Note"
						/>
					</label>
					{#if meta.errors}
						<div class="text-right text-xs text-error">
							{meta.errors[0]?.message}
						</div>
					{/if}
				</div>
			{/snippet}
		</form.Field>

		<!-- preset -->
		<section class="flex flex-col gap-2">
			<div class="text-sm text-neutral">Note Presets:</div>
			<div class="flex flex-wrap gap-1">
				{#if notePresetsQuery.isFetching}
					<div class="skeleton skeleton-text">Loading...</div>
				{:else if notePresetsQuery.isError}
					<div class="text-right text-xs text-error">Failed to load note presets.</div>
				{:else if presets.length === 0}
					<div class="text-sm text-neutral italic">
						No presets available. Manage it under your <a
							class="link"
							href={resolve('/_/profile')}>profile</a
						>.
					</div>
				{:else}
					{#each presets as preset (preset.id)}
						<button
							class="badge flex cursor-pointer items-center rounded-full badge-outline text-xs badge-primary"
							onclick={() => form.setFieldValue('note', preset.tag)}
							type="button"
						>
							{preset.tag}
						</button>
					{/each}
				{/if}
			</div>
		</section>

		<section class="mt-4 flex justify-end gap-2">
			<button class="btn btn-secondary" type="button" onclick={() => onClose()}>
				Cancel
			</button>
			<button class="btn btn-primary" type="submit">Submit</button>
		</section>
	</form>
</BaseDialog>
