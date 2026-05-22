import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  const KEY = 'test-key';

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return the initial value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should return the value from localStorage if it exists', () => {
    window.localStorage.setItem(KEY, JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update the value in both state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify('updated'));
  });

  it('should handle a function as the updater', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 10));

    act(() => {
      result.current[1]((prev: number) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify(15));
  });

  it('should handle complex objects', () => {
    const initialObject = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage(KEY, initialObject));

    const updatedObject = { ...initialObject, city: 'New York' };
    act(() => {
      result.current[1](updatedObject);
    });

    expect(result.current[0]).toEqual(updatedObject);
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify(updatedObject));
  });

  it('should use a function to compute the initial value', () => {
    const initializer = () => 'computed-initial';
    const { result } = renderHook(() => useLocalStorage(KEY, initializer));
    expect(result.current[0]).toBe('computed-initial');
  });
});
