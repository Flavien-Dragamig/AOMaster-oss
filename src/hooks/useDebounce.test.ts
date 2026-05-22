import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce Hook', () => {
  vi.useFakeTimers();

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update the value only after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // Re-render with a new value
    rerender({ value: 'second', delay: 500 });

    // The value should not have changed yet
    expect(result.current).toBe('first');

    // Fast-forward time by 499ms
    act(() => {
      vi.advanceTimersByTime(499);
    });

    // Still the old value
    expect(result.current).toBe('first');

    // Fast-forward time by 1ms to cross the 500ms threshold
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Now the value should be updated
    expect(result.current).toBe('second');
  });

  it('should handle multiple rapid changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    );

    rerender({ value: 'b', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'c', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // The value should still be the initial one
    expect(result.current).toBe('a');

    // Fast-forward to the end of the last timeout
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // The value should now be the last one ('c')
    expect(result.current).toBe('c');
  });
});
