<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import {
		firstRegistrationFormSchema,
		initialValues
	} from '$lib/schema/form/first-registration-form';
	import { createForm } from '@tanstack/svelte-form';

	const form = createForm(() => ({
		defaultValues: initialValues(),
		validators: {
			onSubmit: firstRegistrationFormSchema
		}
	}));
</script>

<section class="grid min-h-screen place-items-center">
	<main class="card w-[min-(80vw_400px)] rounded-lg bg-base-200 p-5">
		<h1 class="bold mb-3 text-2xl">Setup</h1>
		<form
			onsubmit={(ev) => {
				ev.preventDefault();
				ev.stopPropagation();
				form.handleSubmit();
			}}
			class="flex flex-col gap-2"
		>
			<form.Field name="username">
				{#snippet children(field)}
					<label class="label w-full">
						<span>Username</span>
						<input
							type="text"
							class="input w-full"
							placeholder="Username"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) =>
								field.handleChange((e?.target as HTMLInputElement).value)}
						/>
					</label>
					<div class="text-sm text-error">{field.state.meta.errors[0]?.message}</div>
				{/snippet}
			</form.Field>

			<form.Field name="password">
				{#snippet children(field)}
					<label class="label w-full">
						<span>Password</span>
						<input
							type="password"
							class="input w-full"
							placeholder="Password"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) =>
								field.handleChange((e?.target as HTMLInputElement).value)}
						/>
					</label>
					<div class="text-sm text-error">{field.state.meta.errors[0]?.message}</div>
				{/snippet}
			</form.Field>

			<form.Field name="confirmPassword">
				{#snippet children(field)}
					<label class="label w-full">
						<span>Confirm Password</span>
						<input
							type="password"
							class="input w-full"
							placeholder="Confirm Password"
							value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) =>
								field.handleChange((e?.target as HTMLInputElement).value)}
						/>
					</label>
					<div class="text-sm text-error">{field.state.meta.errors[0]?.message}</div>
				{/snippet}
			</form.Field>

			<section class="mt-2 flex flex-col gap-2">
				<button class="btn btn-primary" type="submit">Register</button>
			</section>
		</form>
	</main>
</section>
