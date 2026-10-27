<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { useAuthStore, authStoreActions } from '#lib/client/store/authStore.js';
	import Avatar from 'svelte-boring-avatars';
	import logo from '#lib/assets/trend.png';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const authStore = useAuthStore();

	function handleLogout() {
		authStoreActions.logout();
	}

	function handleNavigateToDashboard() {
		goto(resolve('/_'));
	}

	function handleNavigateToProfile() {
		goto(resolve('/_/profile'));
	}
</script>

<nav class="navbar flex justify-between bg-base-100">
	<section>
		<button class="btn btn-ghost text-xl" onclick={handleNavigateToDashboard}>
			<div class="mr-2">
				<img src={logo} alt="Providentia Logo" class="h-6 w-6 grayscale invert" />
			</div>
			Providentia
		</button>
	</section>

	<section class="flex items-center gap-2">
		<button
			class="btn btn-square overflow-clip rounded-lg btn-ghost"
			title={authStore.current.username ?? 'Anonymous'}
			onclick={handleNavigateToProfile}
		>
			<Avatar
				name={authStore.current.username ?? undefined}
				variant="pixel"
				square
				size={40}
			/>
		</button>
		<button class="btn btn-square btn-primary" title="Logout" onclick={handleLogout}>
			<i class="fa-solid fa-arrow-right-from-bracket"></i>
		</button>
	</section>
</nav>
