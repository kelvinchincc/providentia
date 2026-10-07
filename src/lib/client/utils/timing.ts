export function dispatch(closour: () => void, delay: number = 100): void {
	setTimeout(closour, delay);
}
