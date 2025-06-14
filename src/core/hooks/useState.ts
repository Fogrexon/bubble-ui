// src/core/hooks/useState.ts
import { getCurrentHookState, setHookState, incrementHookIndex } from './manageHooks';
import type { VNode } from '../types';

// useStateの実装
export function useState<S>(initialState: S | (() => S)): [S, (newState: S | ((prevState: S) => S)) => void] {
  const { index: currentHookIndex, hooks, vnode } = getCurrentHookState<S>();

  if (hooks[currentHookIndex] === undefined) {
    const resolvedInitialState = typeof initialState === 'function'
      ? (initialState as () => S)()
      : initialState;
    setHookState(currentHookIndex, resolvedInitialState);
  }

  const setState = (newState: S | ((prevState: S) => S)) => {
    const { index: capturedHookIndex, vnode: capturedVNode } = getCurrentHookState<S>();
    
    // _hooks が存在することを保証 (prepareHooksで初期化されるが念のため)
    if (!capturedVNode._hooks) {
        capturedVNode._hooks = [];
    }

    const currentState = capturedVNode._hooks[capturedHookIndex];
    
    const nextState = typeof newState === 'function'
      ? (newState as (prevState: S) => S)(currentState)
      : newState;

    if (!Object.is(currentState, nextState)) {
      capturedVNode._hooks[capturedHookIndex] = nextState;
      console.log("State updated, component should re-render:", capturedVNode, "New state:", nextState);
      if (capturedVNode._reconciler) {
        capturedVNode._reconciler.scheduleUpdate(capturedVNode);
      } else {
        console.warn("Reconciler instance not found on VNode, cannot schedule update.");
      }
    }
  };

  incrementHookIndex();
  // hooks[currentHookIndex] は setState 内で更新された後の値ではなく、
  // この useState が呼ばれた時点での値なので、これで正しい。
  return [hooks[currentHookIndex], setState];
}
