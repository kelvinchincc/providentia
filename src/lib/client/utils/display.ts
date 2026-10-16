/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import dayjs from 'dayjs';

export function formatDateTime(timestamp: number): string {
	const date = dayjs.unix(timestamp);
	return date.format('DD MMM YYYY, HH:mm:ss');
}

export function formatGemType(value: string): string {
	switch (value) {
		case 'free':
			return 'Free';
		case 'paid':
			return 'Paid';
		default:
			return 'Unknown';
	}
}
