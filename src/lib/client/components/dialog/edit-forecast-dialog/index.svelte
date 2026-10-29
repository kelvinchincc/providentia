<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import BaseDialog from '../base-dialog/index.svelte';

	import type { Props } from './types';
	import {
		updateForecastFormSchema,
		type UpdateForecastForm
	} from '#lib/schema/api/update-forecast.js';
	import { cn } from '#lib/client/utils/cn.js';
	import dayjs from 'dayjs';
	import { createEditForecastMutation } from '#lib/client/services/providentia/mutations/edit-forecast-mutation.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { dispatch } from '#lib/client/utils/timing.js';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';

	const { open, onClose, forecastId, forecastName, targetDate }: Props = $props();

	const uid = $props.id();
	const formId = `${uid}-edit-forecast-form`;

	const queryClient = useQueryClient();
	const editForecastMutation = createEditForecastMutation();

	const form = createForm(() => ({
		defaultValues: {
			name: forecastName,
			targetDate: dayjs.unix(targetDate)
		} as UpdateForecastForm,
		validators: {
			onSubmit: updateForecastFormSchema
		},
		onSubmit: async ({ value: { targetDate, ...value } }) => {
			try {
				await editForecastMutation.mutateAsync({
					...value,
					id: forecastId,
					targetDate: targetDate?.unix()
				});
				alert('Forecast updated succesfully.');
			} catch (error) {
				console.error('Edit forecast error: ', error);
				alert('Opps! Something went wrong! Please try again later.');
			} finally {
				dispatch(() => {
					queryClient.invalidateQueries({ queryKey: queryKeys.forecasts() });
				});
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
			{#snippet children({ state: { value, meta }, handleBlur, handleChange })}
				<label class={cn('input w-full', { 'border-error': meta.errors.length > 0 })}>
					<i class="fa-solid fa-tag"></i>
					<input
						title="Forecast name"
						placeholder="Forecast name"
						type="text"
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
						value={value?.format('YYYY-MM-DD')}
						onblur={handleBlur}
						onchange={(e) => handleChange(dayjs(e.currentTarget.value))}
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
		<button class="btn btn-primary" type="submit" form={formId}>Edit</button>
	</footer>
</BaseDialog>
