/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type Props = {
	open: boolean;
	onClose: () => void;
	recordToEdit: GemRecord | null;
};

export type GemRecord = {
	id: string;
	amount: number;
	type: string;
	note: string | null | undefined;
};
