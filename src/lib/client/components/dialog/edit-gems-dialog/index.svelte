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
	import { dialogStoreActions } from '#lib/client/store/genericDialogStore.js';
	import { dispatch } from '#lib/client/utils/timing.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';

	const { onClose, open, recordToEdit }: Props = $props();
	const queryClient = useQueryClient();
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
				dialogStoreActions.alert('Unable to update gem record. Please try again later.', {
					title: 'Unexpected Error Occurred'
				});
			} finally {
				dispatch(() => {
					queryClient.invalidateQueries({ queryKey: queryKeys.gemHistory() });
					queryClient.invalidateQueries({ queryKey: queryKeys.gemsOverview() });
				});
			}
		}
	}));

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
							onchange={(e) => handleChange((e.target as HTMLInputElement).value)}
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
								handleChange((e.target as HTMLSelectElement).value as typeof value);
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
							onchange={(e) => handleChange((e.target as HTMLInputElement).value)}
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

		<section class="mt-4 flex justify-end gap-2">
			<button class="btn btn-secondary" type="button" onclick={() => onClose()}>
				Cancel
			</button>
			<button class="btn btn-primary" type="submit">Submit</button>
		</section>
	</form>
</BaseDialog>
