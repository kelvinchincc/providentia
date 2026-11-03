<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { resolve } from '$app/paths';

	const iconCredits = [
		{
			name: 'Font Awesome 7',
			url: 'https://fontawesome.com'
		},
		{
			name: 'Statistics icons created by Magnific - Flaticon',
			url: 'https://www.flaticon.com/free-icons/statistics'
		}
	].sort((a, b) => a.name.localeCompare(b.name));

	const libCredits = [
		{
			name: 'Argon2',
			url: 'https://github.com/ranisalt/node-argon2'
		},
		{
			name: 'Axios',
			url: 'https://axios-http.com/'
		},
		{
			name: 'catppuccin/daisyui',
			url: 'https://www.npmjs.com/package/@catppuccin/daisyui'
		},
		{
			name: 'DaisyUI',
			url: 'https://daisyui.com/'
		},
		{
			name: 'Day.js',
			url: 'https://day.js.org/'
		},
		{
			name: 'dotenv',
			url: 'https://github.com/motdotla/dotenv'
		},
		{
			name: 'JOSE',
			url: 'https://github.com/panva/jose'
		},
		{
			name: 'LibSQL Client',
			url: 'https://github.com/tursodatabase/libsql-client-ts'
		},
		{
			name: 'Svelte',
			url: 'https://svelte.dev/'
		},
		{
			name: 'Svelte Boring Avatars',
			url: 'https://www.npmjs.com/package/svelte-boring-avatars'
		},
		{
			name: 'SvelteKit',
			url: 'https://kit.svelte.dev/'
		},
		{
			name: 'Tailwind CSS',
			url: 'https://tailwindcss.com/'
		},
		{
			name: 'TanStack Form',
			url: 'https://tanstack.com/form/v1'
		},
		{
			name: 'TanStack Query',
			url: 'https://tanstack.com/query/v4'
		},
		{
			name: 'TanStack Store',
			url: 'https://tanstack.com/store/latest'
		},
		{
			name: 'Winston',
			url: 'https://github.com/winstonjs/winston'
		},
		{
			name: 'Zod',
			url: 'https://zod.dev/'
		}
	].sort((a, b) => a.name.localeCompare(b.name));
</script>

<main class="p-4">
	<h1 class="mb-1 text-3xl"><a href={resolve('/')} class="link link-primary">Providentia</a></h1>

	<p>
		Providentia is Open Sourced under the
		<a href="https://www.mozilla.org/en-US/MPL/2.0/" class="link link-primary">
			Mozilla Public License 2.0
		</a>
	</p>

	<h2 class="mt-4 mb-1 text-2xl">Icon used</h2>
	<ul class="list-disc pl-4">
		{#each iconCredits as { name, url } (url)}
			{@render creditLink(url, name)}
		{/each}
	</ul>

	<h2 class="mt-4 mb-1 text-2xl">Libraries used</h2>
	<p>
		Check out the libraries used in Providentia, and refer to their documentation for the
		licenses:
	</p>
	<ul class="list-disc pl-4">
		{#each libCredits as { name, url } (url)}
			{@render creditLink(url, name)}
		{/each}
	</ul>
</main>

{#snippet creditLink(link: string, name: string)}
	<li>
		<a
			href={link}
			target="_blank"
			rel="external noopener noreferrer"
			title={name}
			class="link link-primary"
		>
			{name}
		</a>
	</li>
{/snippet}
