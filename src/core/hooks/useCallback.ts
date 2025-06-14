// src/core/hooks/useCallback.ts
import { useMemo } from './useMemo';
// useCallback自体は直接manageHooksのヘルパーを使わないが、
// useMemoが内部でそれらを利用している。

// useCallbackの実装
export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T {
  // useMemoを使用してcallbackをメモ化する
  // useCallback(fn, deps) is equivalent to useMemo(() => fn, deps).
  return useMemo(() => callback, deps);
}
