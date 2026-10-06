<script lang="ts">
	import { createLogoutMutation } from '#lib/client/services/providentia/mutations/logout-mutation.js';

	const logoutMutattion = createLogoutMutation();
</script>

<h1>Oh Hi!</h1>

<p>
	Click here to logout.<br />

	<button class="btn btn-primary" onclick={() => logoutMutattion.mutate()}>Logout</button>
</p>
