import { useState, useEffect, useRef } from 'react';

// --- Persistent State Hook (debounced writes to localStorage) ---
export const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [state, setState] = useState<T>(defaultValue);
	const [isHydrated, setIsHydrated] = useState(false);
	const writeTimer = useRef<number | null>(null);

	// Hydrate from localStorage after mount (prevents hydration mismatch)
	useEffect(() => {
		try {
			const storedValue = localStorage.getItem(key);
			if (storedValue !== null) {
				setState(JSON.parse(storedValue));
			}
		} catch (error) {
			console.error("Error reading from localStorage", error);
		}
		setIsHydrated(true);
	}, [key]);

	// Debounce writes to avoid synchronous blocking on each state change.
	useEffect(() => {
		if (!isHydrated) return; // Don't write until hydrated

		// Clear any previous timer
		if (writeTimer.current !== null) {
			window.clearTimeout(writeTimer.current);
		}
		// Schedule write (debounce 300ms)
		writeTimer.current = window.setTimeout(() => {
			try {
				localStorage.setItem(key, JSON.stringify(state));
			} catch (error) {
				console.error("Error writing to localStorage", error);
			} finally {
				writeTimer.current = null;
			}
		}, 300);

		return () => {
			if (writeTimer.current !== null) {
				window.clearTimeout(writeTimer.current);
				writeTimer.current = null;
			}
		};
	}, [key, state, isHydrated]);

	// Flush on unmount (best-effort)
	useEffect(() => {
		return () => {
			if (writeTimer.current !== null) {
				try {
					localStorage.setItem(key, JSON.stringify(state));
				} catch (error) {
					/* ignore */
				}
				window.clearTimeout(writeTimer.current);
				writeTimer.current = null;
			}
		};
	}, [key, state]); // Include dependencies to capture latest state

	return [state, setState];
};
