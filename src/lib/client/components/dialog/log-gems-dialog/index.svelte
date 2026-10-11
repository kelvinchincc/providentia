<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<script lang="ts">
	import type { Props } from './types';
	import BaseDialog from '#lib/client/components/dialog/base-dialog/index.svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { createDefaultValues, logGemSchema } from '#lib/schema/api/log-gems.js';
	import { dialogStoreActions } from '#lib/client/store/genericDialogStore.js';
	import { cn } from '#lib/client/utils/cn.js';
	import { dispatch } from '#lib/client/utils/timing.js';

	const { open, onClose }: Props = $props();

	const form = createForm(() => ({
		defaultValues: createDefaultValues(),
		validators: {
			onSubmit: logGemSchema
		},
		onSubmit: ({ value }) => {
			dialogStoreActions.alert(JSON.stringify(value));
		}
	}));

	const presets = ['Store Purchase', 'Daily Reward', 'Event Reward'];

	$effect(() => {
		if (open) return;

		dispatch(() => form.reset());
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
							placeholder="Amount"
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
			{#snippet children({ state: { value, meta }, handleBlur, handleChange })}
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
							<option value="free">Free</option>
							<option value="paid">Paid</option>
						</select>
					</label>
					{#if meta.errors.length}
						<div class="text-right text-xs text-error">
							{meta.errors[0]?.message}
						</div>
					{/if}
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="note">
			{#snippet children({ state: { value, meta }, handleBlur, handleChange })}
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

					{#if meta.errors.length}
						<div class="text-right text-sm text-error">{meta.errors[0]?.message}</div>
					{/if}
				</div>
			{/snippet}
		</form.Field>

		<!-- preset -->
		<section class="flex flex-col gap-2">
			<div class="text-sm text-neutral">Note Presets:</div>
			<div class="flex gap-2">
				{#each presets as preset (preset)}
					<button
						class="badge flex cursor-pointer items-center rounded-full text-xs badge-primary"
						onclick={() => form.setFieldValue('note', preset)}
					>
						{preset}
					</button>
				{/each}
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
