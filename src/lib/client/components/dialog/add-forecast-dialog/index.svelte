<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import BaseDialog from '../base-dialog/index.svelte';

	import type { BaseDialogProps } from '../base-dialog/types';
	import {
		createDefaultValues,
		createForecastFormSchema
	} from '#lib/schema/api/create-forecast.js';
	import { cn } from '#lib/client/utils/cn.js';
	import dayjs from 'dayjs';
	import { createAddForecastMutation } from '#lib/client/services/providentia/mutations/add-forecast-mutation.js';
	import { dispatch } from '#lib/client/utils/timing.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';

	const { open, onClose }: BaseDialogProps = $props();
	const uid = $props.id();
	const formId = `${uid}-create-forecast-form`;

	const queryClient = useQueryClient();
	const addForecastMutation = createAddForecastMutation();

	const form = createForm(() => ({
		defaultValues: createDefaultValues(),
		validators: {
			onSubmit: createForecastFormSchema
		},
		onSubmit: async ({ value }) => {
			try {
				await addForecastMutation.mutateAsync({
					name: value.name,
					targetDate: value.targetDate?.unix() || 0
				});
				alert('Forecast added successfully!');
			} catch (error) {
				console.error('Error adding forecast:', error);
				alert('An error occurred while adding the forecast. Please try again.');
			} finally {
				onClose();
				dispatch(() => queryClient.invalidateQueries({ queryKey: queryKeys.forecasts() }));
			}
		}
	}));

	$effect(() => {
		if (!open) {
			form.reset();
		}
	});
</script>

<BaseDialog {open} {onClose}>
	<header class="mb-4">
		<h3 class="text-lg font-bold">Log Gems</h3>
	</header>

	<form
		id={formId}
		class="flex flex-col gap-2"
		onsubmit={(e) => {
			e.preventDefault();
			form.handleSubmit();
		}}
	>
		<form.Field name="name">
			{#snippet children({ state: { meta, value }, handleBlur, handleChange })}
				<label class={cn('input w-full', { 'border-error': meta.errors.length > 0 })}>
					<i class="fa-solid fa-tag"></i>
					<input
						type="text"
						class="input"
						placeholder="Forecast name"
						{value}
						onblur={handleBlur}
						onchange={(e) => handleChange(e.currentTarget.value)}
					/>
				</label>
				{#if meta.errors.length > 0}
					<p class="text-sm text-error">{meta.errors[0]?.message}</p>
				{/if}
			{/snippet}
		</form.Field>

		<form.Field name="targetDate">
			{#snippet children({ state: { meta, value }, handleBlur, handleChange })}
				<label class={cn('input w-full', { 'border-error': meta.errors.length > 0 })}>
					<i class="fa-solid fa-calendar-days"></i>
					<input
						type="date"
						title="Target date"
						placeholder="Target date"
						value={value?.format('YYYY-MM-DD')}
						onblur={handleBlur}
						onchange={(e) => {
							handleChange(dayjs(e.currentTarget.value));
						}}
					/>
				</label>
				{#if meta.errors.length > 0}
					<p class="text-sm text-error">{meta.errors[0]?.message}</p>
				{/if}
			{/snippet}
		</form.Field>
	</form>

	<footer class="mt-4 flex justify-end gap-2">
		<button class="btn btn-secondary" onclick={onClose}>Cancel</button>
		<button class="btn btn-primary" type="submit" form={formId}>Add</button>
	</footer>
</BaseDialog>
