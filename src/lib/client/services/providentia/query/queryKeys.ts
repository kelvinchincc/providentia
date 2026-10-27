/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const queryKeys = {
	base: ['providentia'] as const,
	gemHistory: () => [...queryKeys.base, 'gem-history'] as const,
	gemHistoryWithParams: (params: { from: string; limit: number }) =>
		[...queryKeys.gemHistory(), params] as const,
	gemsOverview: () => [...queryKeys.base, 'stats', 'overview'] as const,

	notePresets: () => [...queryKeys.base, 'note-presets'] as const
};
