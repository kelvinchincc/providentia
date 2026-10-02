import dayjs from "dayjs";

export function generateCurrentTimestamp() {
	return dayjs().unix();
}
