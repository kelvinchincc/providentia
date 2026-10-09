/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface Props {
	/**
	 * Whether the modal dialog is open or not.
	 */
	open: boolean;
	/**
	 * The title of the modal dialog.
	 */
	title?: string;
	/**
	 * The message to display in the modal dialog.
	 */
	message: string;
	/**
	 * When ok button clicked, this function will be called.
	 */
	onOk?: () => void;
	/**
	 * When cancel button clicked, this function will be called. Cancel button will not be displayed if this function
	 * is not provided.
	 * @returns
	 */
	onCancel?: () => void;
	/**
	 * When the modal dialog is closed, this function will be called. Both cancel and ok button will trigger this
	 * function. If you want to handle the cancel button click, use onCancel instead.
	 * @returns
	 */
	onClose?: () => void;
}
