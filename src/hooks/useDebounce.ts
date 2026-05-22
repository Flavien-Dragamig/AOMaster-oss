/**
 * @fileoverview A custom React hook that debounces a value.
 * This is useful for delaying the execution of a function or effect until after
 * a certain amount of time has passed without the value changing.
 * For example, delaying a search API call until the user has stopped typing.
 */

import { useState, useEffect } from 'react';

/**
 * Debounces a value.
 * @template T The type of the value to debounce.
 * @param {T} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {T} The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if the value changes
    // or the component unmounts.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}
