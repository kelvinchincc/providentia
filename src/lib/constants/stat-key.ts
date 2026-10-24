/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const StatKey = {
	/**
	 * Total number of gems the user has obtained, including both free and paid gems.
	 */
	TOTAL_GEMS: 'total-gems',
	/**
	 * Total number of free gems the user has obtained.
	 */
	TOTAL_FREE_GEMS: 'total-free-gems',
	/**
	 * Total number of paid gems the user has obtained.
	 */
	TOTAL_PAID_GEMS: 'total-paid-gems',
	/**
	 * Daily average number of gems the user will be obtained, usually daily login rewards. Currently unused as it is
	 * static stats.
	 */
	LINEAR_GAINS: 'linear-gains',
	/**
	 * Average number of gems the user will be obtained in a day, base on the previous 30 days of gem gains. This is a
	 * more accurate representation of the user's gem gains than LINEAR_GAINS.
	 */
	MONTHLY_AVG_GAINS: 'monthly-avg-gains'
};
