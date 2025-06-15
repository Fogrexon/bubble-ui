// src/core/hooks/useState.ts
import { getCurrentHookState, setHookState, incrementHookIndex } from './manageHooks';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { VNode } from '../types';

// useStateの実装
export function useState<S>(
  initialState: S | (() => S)
): [S, (newState: S | ((prevState: S) => S)) => void] {
  // useStateが呼び出された時点のvnodeとhookIndexをキャプチャ
  const {
    index: hookIndexForThisState,
    vnode: vnodeForThisState,
    hooks,
  } = getCurrentHookState<S>();

  if (hooks[hookIndexForThisState] === undefined) {
    const resolvedInitialState =
      typeof initialState === 'function' ? (initialState as () => S)() : initialState;
    // setHookStateは現在のcurrentProcessingVNodeとcurrentHookIndexを使うので、
    // useState呼び出し時のインデックスを渡す必要がある。
    // しかし、setHookStateは内部でcurrentProcessingVNode[currentHookIndex]にセットするので、
    // ここで直接vnodeForThisState._hooksにセットする方が安全かもしれない。
    // manageHooksのsetHookStateがカレントコンテキストに依存しているため、
    // useStateが呼ばれた時点のインデックスで正しく設定される。
    setHookState(hookIndexForThisState, resolvedInitialState);
  }

  const setState = (newState: S | ((prevState: S) => S)) => {
    // setStateが呼び出されたとき、それが定義された時点のvnodeとhookIndexを使用する
    // getCurrentHookState() をここで呼ぶと、非同期コールバックの場合にコンテキストがずれる

    // vnodeForThisState と hookIndexForThisState をクロージャでキャプチャして使用
    if (!vnodeForThisState._hooks) {
      // vnodeForThisStateのフック配列を保証
      vnodeForThisState._hooks = [];
    }

    const currentState = vnodeForThisState._hooks[hookIndexForThisState];

    const nextState =
      typeof newState === 'function' ? (newState as (prevState: S) => S)(currentState) : newState;

    if (!Object.is(currentState, nextState)) {
      vnodeForThisState._hooks[hookIndexForThisState] = nextState;
      // console.log(
      //   'State updated, component should re-render:',
      //   vnodeForThisState,
      //   'New state:',
      //   nextState
      // );
      if (vnodeForThisState._reconciler) {
        vnodeForThisState._reconciler.scheduleUpdate(vnodeForThisState);
      } else {
        // console.warn('Reconciler instance not found on VNode, cannot schedule update.');
      }
    }
  };

  incrementHookIndex();
  return [hooks[hookIndexForThisState], setState];
}
