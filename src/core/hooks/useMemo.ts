// src/core/hooks/useMemo.ts
import { getCurrentHookState, setHookState, incrementHookIndex } from './manageHooks';

interface MemoHook<T> {
  value: T;
  deps?: any[];
}

// useMemoの実装
export function useMemo<T>(factory: () => T, deps?: any[]): T {
  const { index: currentHookIndex, hooks } = getCurrentHookState<MemoHook<T>>();

  const oldHookState = hooks[currentHookIndex];
  const oldDeps = oldHookState ? oldHookState.deps : undefined;

  const hasChangedDeps = deps ? !oldDeps || deps.some((dep, i) => !Object.is(dep, oldDeps[i])) || deps.length !== oldDeps.length : true;

  if (hasChangedDeps || !oldHookState) { // oldHookStateが存在しない場合も再計算 (初回など)
    const value = factory();
    setHookState(currentHookIndex, { value, deps });
    incrementHookIndex();
    return value;
  }

  incrementHookIndex();
  return oldHookState.value;
}
