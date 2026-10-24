/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TOTAL_WEEKLY_GEMS_OBTAINABLE } from '$app/env/private';

export const DAILY_AVERAGE_GEMS_OBTAINED = Math.floor(TOTAL_WEEKLY_GEMS_OBTAINABLE / 7);
