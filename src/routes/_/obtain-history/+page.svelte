<!--
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->
<script lang="ts">
	import { createGemsHistoryQuery } from '#lib/client/services/providentia/query/gems-history-query.js';

	const gemsHistoryQuery = createGemsHistoryQuery({ from: '', limit: 10 });

	$effect(() => {
		console.log(gemsHistoryQuery.data);
	});
</script>

<section class="mx-auto w-200">
	<div class="rounded-lg border border-base-content/5">
		<table class="table">
			<thead>
				<tr>
					<th class="w-10 max-w-20"></th>
					<th class="w-15">Amount</th>
					<th class="w-45">Obtained At</th>
					<th class="w-45">Updated At</th>
					<th class="w-15">Type</th>
					<th class="">Note</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>1</td>
					<td>300</td>
					<td>2026-10-08 23:45:00</td>
					<td>2026-10-08 23:45:00</td>
					<td>Free</td>
					<td>Test</td>
				</tr>
				<tr>
					<td>2</td>
					<td>300</td>
					<td>2026-10-08 23:45:00</td>
					<td>2026-10-08 23:45:00</td>
					<td>Paid</td>
					<td>Test</td>
				</tr>
			</tbody>
		</table>
	</div>

	<button class="btn mt-2 btn-ghost">
		<i class="fa-solid fa-chevron-down"></i>
		Load More...
	</button>
</section>
