<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { useAuthStore, authStoreActions } from '#lib/client/store/authStore.js';
	import Avatar from 'svelte-boring-avatars';

	const authStore = useAuthStore();

	function handleLogout() {
		authStoreActions.logout();
	}
</script>

<nav class="navbar flex justify-between bg-base-100">
	<section>
		<button class="btn btn-ghost text-xl">
			<img src="/trend.png" alt="Providentia Logo" class="mr-2 h-6 w-6" />
			Providentia
		</button>
	</section>

	<section class="flex items-center gap-2">
		<div class="overflow-clip rounded-lg" title={authStore.current.username ?? 'Anonymous'}>
			<Avatar
				name={authStore.current.username ?? undefined}
				variant="pixel"
				square
				size={40}
			/>
		</div>
		<button class="btn btn-square btn-primary" title="Logout" onclick={handleLogout}>
			<i class="fa-solid fa-arrow-right-from-bracket"></i>
		</button>
	</section>
</nav>
