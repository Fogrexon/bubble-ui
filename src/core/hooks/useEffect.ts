// src/core/hooks/useEffect.ts
import { getCurrentHookState, setHookState, incrementHookIndex } from './manageHooks';
import type { VNode } from '../types'; // VNode型をインポート

interface EffectHook {
  deps?: any[];
  effect: () => (() => void) | void;
  cleanup?: () => void;
  hasRun?: boolean; // 初回実行を管理するため (commitHooksで利用想定)
}

// useEffectの実装
export function useEffect(effect: () => (() => void) | void, deps?: any[]) {
  const { index: currentHookIndex, hooks, vnode: currentVNode } = getCurrentHookState<EffectHook>(); // component を vnode に変更

  const oldHookState = hooks[currentHookIndex];
  const oldDeps = oldHookState ? oldHookState.deps : undefined;

  const hasChangedDeps = deps ? !oldDeps || deps.some((dep, i) => !Object.is(dep, oldDeps[i])) || deps.length !== oldDeps.length : true;

  if (hasChangedDeps) {
    // 副作用とその依存関係、クリーンアップ関数を保存する
    const newHookState: EffectHook = { effect, deps, hasRun: false };
    setHookState(currentHookIndex, newHookState);

    // 副作用のスケジューリングは commitHooks で行われる
    // console.log("Effect scheduled for commit:", currentVNode, "hookIndex:", currentHookIndex);
  }

  incrementHookIndex();
}

// useEffectの副作用を実行し、クリーンアップ関数を登録するヘルパー (commitHooksから呼ばれる想定)
export function runEffect(vnode: VNode, hookIndex: number) { // component を vnode に変更
  if (!vnode || !vnode._hooks || !vnode._hooks[hookIndex]) {
    return;
  }
  const hook: EffectHook = vnode._hooks[hookIndex];
  if (hook && hook.effect && !hook.hasRun) {
    // Reactの動作: commitフェーズで、まず前回のeffectのcleanupを実行し、その後新しいeffectを実行する。
    // このrunEffectは新しいeffectを実行する部分。
    // cleanupは、依存配列が変わった場合、またはアンマウント時に実行される。
    // 依存配列が変わった場合の古いcleanupは、useEffect内で新しいhook stateを登録する直前か、
    // またはcommitHooksでrunEffectの直前に実行するのが適切。
    // ここでは、manageHooks.tsのcommitHooksが単純に全useEffectのrunEffectを呼ぶ想定なので、
    // cleanupの呼び出しはuseEffect内か、commitHooksのrunEffect呼び出し前で行う必要がある。
    // 現状のuseEffectでは、hasChangedDeps時に古いcleanupを呼ぶロジックはコメントアウトされている。
    // 一旦、runEffect時には新しいeffectの実行のみに集中する。
    // 古いcleanupは、useEffectが新しいhookを登録する際に（もしあれば）実行するか、
    // またはcommitHooksがrunEffectの前にそのインデックスの古いcleanupを実行する。

    // 簡略化のため、もし古いhook stateにcleanupがあればここで実行するアプローチも考えられるが、
    // 正確なタイミング制御はReconcilerとの連携でより明確になる。
    // if (oldHookState && typeof oldHookState.cleanup === 'function') { // oldHookStateはこのスコープにない
    //    oldHookState.cleanup();
    // }

    const cleanup = hook.effect();
    vnode._hooks[hookIndex].cleanup = cleanup;
    vnode._hooks[hookIndex].hasRun = true;
  }
}

// useEffectのクリーンアップを実行するヘルパー (cleanupHooksから呼ばれる想定)
export function cleanupEffect(vnode: VNode, hookIndex: number) { // component を vnode に変更
    if (!vnode || !vnode._hooks || !vnode._hooks[hookIndex]) {
        return;
    }
    const hook: EffectHook = vnode._hooks[hookIndex];
    if (hook && typeof hook.cleanup === 'function') {
        hook.cleanup();
        // クリーンアップ後、再度実行されないようにするなどの処理が必要な場合がある
        // vnode._hooks[hookIndex].cleanup = undefined; // 例えば
    }
}
