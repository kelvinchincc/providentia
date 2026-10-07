<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import dayjs from 'dayjs';

	const year = dayjs().year();
</script>

<footer class="flex justify-between bg-base-200 p-3 text-xs">
	<div>
		<i class="fa-regular fa-copyright -scale-x-100" aria-label="copyleft"></i>{year} A side project
		by
		<a href="https://github.com/kelvinchincc" target="_blank" class="link link-primary"
			>Kelvin Chin</a
		>, licensed under
		<a href="http://mozilla.org/MPL/2.0/" target="_blank" class="link link-primary">MPL 2.0</a>.
	</div>
	<ul class="flex gap-2">
		<li>
			<a href="/about" class="bold link link-primary">Credit</a>
		</li>
		<li>
			<a
				href="https://github.com/kelvinchincc/providentia"
				target="_blank"
				class="bold link link-primary"
			>
				GitHub
			</a>
		</li>
	</ul>
</footer>
