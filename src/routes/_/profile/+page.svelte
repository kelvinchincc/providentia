<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import AddNotePresetDialog from '#lib/client/components/dialog/add-note-preset-dialog/index.svelte';
	import UpdateNotePresetDialog from '#lib/client/components/dialog/update-note-preset-dialog/index.svelte';

	import { createNotePresetsQuery } from '#lib/client/services/providentia/query/note-presets-query.js';
	import { cn } from '#lib/client/utils/cn.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import SectionCard from './SectionCard.svelte';
	import { dispatch } from '#lib/client/utils/timing.js';
	import { queryKeys } from '#lib/client/services/providentia/query/queryKeys.js';
	import { createDeleteNotePresetMutation } from '#lib/client/services/providentia/mutations/delete-note-preset-mutation.js';
	import { createForceRescanStatMutation } from '#lib/client/services/providentia/mutations/force-rescan-stat-mutatiion.js';
	import { authStoreActions, useAuthStore } from '#lib/client/store/authStore.js';
	import { createLogoutAllMutation } from '#lib/client/services/providentia/mutations/logout-all-mutation.js';
	import { createUpdateProfileMutation } from '#lib/client/services/providentia/mutations/update-profile-mutation.js';

	const uid = $props.id();
	const notePresetsQuery = createNotePresetsQuery();
	const notePresets = $derived(notePresetsQuery.data ?? []);
	const queryClient = useQueryClient();
	const logoutAllDevicesMutation = createLogoutAllMutation();
	const forceRescanStatsMutation = createForceRescanStatMutation();
	const deleteNotePresetMutation = createDeleteNotePresetMutation();
	const updateProfileMutation = createUpdateProfileMutation();
	const authStore = useAuthStore();

	let isAddNotePresetDialogOpen = $state(false);
	let isUpdateNotePresetDialogOpen = $state(false);
	let notePresetIdToUpdate = $state('');
	let currentNotePresetToPopulate = $state('');
	let username = $state(authStore.current.username ?? '');
	let password = $state('');
	let confirmPassword = $state('');

	let passwordError = $state('');
	let confirmPasswordError = $state('');

	async function handleUpdateProfile() {
		passwordError = '';
		confirmPasswordError = '';

		if (password && (password.length < 8 || password.length > 100)) {
			passwordError = 'Password must be between 8 and 100 characters.';
			return;
		}

		if (password !== confirmPassword) {
			confirmPasswordError = 'Passwords do not match.';
			return;
		}

		const payload = {
			username: (username === authStore.current.username ? undefined : username) || undefined,
			password: password || undefined,
			confirmPassword: confirmPassword || undefined
		};

		// if all undefined, do not send request
		if (!payload.username && !payload.password && !payload.confirmPassword) {
			alert('No changes to update.');
			return;
		}

		try {
			await updateProfileMutation.mutateAsync(payload);
			alert('Profile updated successfully, please log in again.');
			authStoreActions.logout();
		} catch (error) {
			console.error('Error updating profile:', error);
			alert('Failed to update profile. Please try again later.');
		} finally {
			dispatch(() => {
				queryClient.invalidateQueries({ queryKey: queryKeys.base });
			});
		}
	}

	async function handleLogoutAllDevices() {
		let confirmed = confirm(
			'Are you sure you want to logout from all devices? This action cannot be undone.'
		);
		if (!confirmed) return;

		try {
			await logoutAllDevicesMutation.mutateAsync();
			alert('Logged out from all devices, please log in again.');
			authStoreActions.logout();
		} catch (error) {
			console.error('Error logging out from all devices:', error);
			alert('Failed to logout from all devices. Please try again later.');
		}
	}

	async function handleRescanStats() {
		let confirmed = confirm(
			'Are you sure you want to rescan stats? This action may take a while.'
		);
		if (!confirmed) return;

		try {
			await forceRescanStatsMutation.mutateAsync();
			alert('Stats rescanned successfully!');
		} catch (error) {
			console.error('Error rescanning stats:', error);
			alert('Failed to rescan stats. Please try again later.');
		} finally {
			dispatch(() => {
				dispatch(() => {
					queryClient.invalidateQueries({ queryKey: queryKeys.forecasts() });
					queryClient.invalidateQueries({ queryKey: queryKeys.gemsOverview() });
				});
			});
		}
	}

	async function handleAddNotePreset() {
		isAddNotePresetDialogOpen = true;
	}

	async function handleUpdateNotePreset(id: string, currentPreset: string) {
		notePresetIdToUpdate = id;
		isUpdateNotePresetDialogOpen = true;
		currentNotePresetToPopulate = currentPreset;
	}

	async function handleDeletePreset(id: string) {
		const confirmed = confirm(
			'Are you sure you want to delete this preset? This action cannot be undone.'
		);
		if (!confirmed) return;

		try {
			await deleteNotePresetMutation.mutateAsync(id);
			alert('Note preset deleted successfully!');
		} catch (error) {
			console.error('Error deleting note preset:', error);
			alert('Failed to delete note preset. Please try again later.');
		} finally {
			dispatch(() => {
				queryClient.invalidateQueries({ queryKey: queryKeys.notePresets() });
			});
		}
	}
</script>

<AddNotePresetDialog
	open={isAddNotePresetDialogOpen}
	onClose={() => (isAddNotePresetDialogOpen = false)}
/>
<UpdateNotePresetDialog
	open={isUpdateNotePresetDialogOpen}
	onClose={() => (isUpdateNotePresetDialogOpen = false)}
	idToUpdate={notePresetIdToUpdate}
	currentContent={currentNotePresetToPopulate}
/>

<main class="mx-auto flex max-w-[min(80vw,500px)] flex-col gap-3">
	<h1 class="text-2xl font-bold">Profile</h1>
	<SectionCard title="User Info">
		<div class="grid grid-cols-[auto_1fr] place-items-center gap-2">
			<label class="label w-full" for={`${uid}:username-input`}> Username </label>
			<input
				id={`${uid}:username-input`}
				type="text"
				class="input w-full"
				bind:value={username}
				placeholder="Username"
			/>

			<label class="label w-full" for={`${uid}:password-input`}> Password </label>
			<div class="w-full">
				<input
					id={`${uid}:password-input`}
					type="password"
					class={cn('input w-full', { 'border-error': passwordError })}
					bind:value={password}
					placeholder="Password"
				/>
				{#if passwordError}
					<p class="text-sm text-error">{passwordError}</p>
				{/if}
			</div>

			<label class="label w-full" for={`${uid}:confirm-password-input`}>
				Confirm Password
			</label>
			<div class="w-full">
				<input
					id={`${uid}:confirm-password-input`}
					type="password"
					class={cn('input w-full', { 'border-error': confirmPasswordError })}
					bind:value={confirmPassword}
					placeholder="Confirm Password"
				/>
				{#if confirmPasswordError}
					<p class="text-sm text-error">{confirmPasswordError}</p>
				{/if}
			</div>

			<button class="btn col-span-2 mt-2 btn-block btn-primary" onclick={handleUpdateProfile}>
				<i class="fa-regular fa-circle-up"></i>
				Update
			</button>
		</div>
	</SectionCard>

	<SectionCard title="Security">
		<section>
			<h3 class="mb-2 text-lg font-bold">Logout All Devices</h3>
			<button class="btn btn-block btn-error" onclick={handleLogoutAllDevices}>
				<i class="fa-solid fa-right-from-bracket"></i>
				Logout everywhere
			</button>
		</section>
	</SectionCard>

	<SectionCard title="Rescan Stats">
		<button
			class="btn btn-block btn-primary"
			onclick={handleRescanStats}
			disabled={forceRescanStatsMutation.isPending}
		>
			<i class="fa-solid fa-repeat"></i>
			Force Rescan Stats
		</button>
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
							<button
								class="btn btn-square btn-secondary"
								aria-label="Edit"
								onclick={() => handleUpdateNotePreset(preset.id, preset.tag)}
							>
								<i class="fa-solid fa-pen-to-square"></i>
							</button>
							<button
								class="btn btn-square btn-error"
								aria-label="Delete"
								onclick={() => handleDeletePreset(preset.id)}
							>
								<i class="fa-solid fa-trash"></i>
							</button>
						</section>
					</div>
				{/each}
				<button
					class="btn btn-primary"
					onclick={handleAddNotePreset}
					disabled={notePresetsQuery.isFetching}
				>
					<i class="fa-solid fa-plus"></i>
					Add
				</button>
			</section>
		{/if}
	</SectionCard>
</main>
