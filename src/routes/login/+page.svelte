<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { loginFormSchema, initialValues } from '#lib/schema/form/login-form.js';
	import { createForm } from '@tanstack/svelte-form';
	import { createLoginMutation } from '#lib/client/services/providentia/mutations/login-mutation.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authStoreActions } from '#lib/client/store/authStore.js';
	import { dispatch } from '#lib/client/utils/timing.js';

	const loginMutation = createLoginMutation();

	const form = createForm(() => ({
		defaultValues: initialValues(),
		validators: {
			onSubmit: loginFormSchema
		},
		onSubmit: async ({ value }) => {
			try {
				const result = await loginMutation.mutateAsync(value);
				if (!result.success) {
					alert('Login failed, please try again.');
					return;
				}
				authStoreActions.login(
					result.data.username,
					result.data.authTokenTTL,
					result.data.refreshTokenTTL
				);
				dispatch(() => goto(resolve('_')));
			} catch (error) {
				alert('Login failed, please try again.');
				console.error('Login error:', error);
			}
		}
	}));
</script>

<main class="grid min-h-screen place-items-center p-3">
	<section class="card w-100 gap-2 bg-base-200 p-4 shadow-2xl">
		<h1 class="mb-2 text-2xl">Login</h1>

		<form
			class="flex flex-col gap-2"
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Field name="username">
				{#snippet children(field)}
					<label class="input w-full">
						<span><i class="fas fa-user"></i></span>
						<input
							type="text"
							placeholder="Username"
							value={field.state.value}
							onchange={(e) => {
								field.handleChange((e.target as HTMLInputElement)?.value);
							}}
							onblur={field.handleBlur}
						/>
					</label>
					<div class="text-xs text-error">
						{field.state.meta.errors[0]?.message}
					</div>
				{/snippet}
			</form.Field>
			<form.Field name="password">
				{#snippet children(field)}
					<label class="input w-full">
						<span><i class="fas fa-lock"></i></span>
						<input
							type="password"
							placeholder="Password"
							onblur={field.handleBlur}
							onchange={(e) => {
								field.handleChange((e.target as HTMLInputElement)?.value);
							}}
						/>
					</label>
					<div class="text-xs text-error">
						{field.state.meta.errors[0]?.message}
					</div>
				{/snippet}
			</form.Field>

			<section class="mt-1 flex flex-col gap-2">
				<button class="btn btn-primary" type="submit">Login</button>
			</section>
		</form>
	</section>
</main>
