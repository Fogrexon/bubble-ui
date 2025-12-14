// src/core/hooks/manageHooks.ts
import { runEffect, cleanupEffect } from './useEffect'; // useEffectからヘルパーをインポート
import type { VNode } from '../types'; // VNode型をインポート

// 現在処理中のコンポーネントインスタンス (VNode) とフックインデックス
// これらはレンダリングサイクルごとに prepareHooks で設定される
let currentProcessingVNode: VNode | null = null;
let currentHookIndex = 0;

// コンポーネントのレンダリング前に呼び出される関数
export function prepareHooks(vnode: VNode) {
  currentProcessingVNode = vnode;
  currentHookIndex = 0;
  // VNodeにフック配列がなければ初期化
  if (!currentProcessingVNode._hooks) {
    currentProcessingVNode._hooks = [];
  }
}

// フックを使用するコンポーネントのレンダリング後に呼び出される関数
export function commitHooks(vnode: VNode) {
  if (!vnode || !vnode._hooks) {
    return;
  }
  vnode._hooks.forEach((_hook: any, index: number) => {
    runEffect(vnode, index); // runEffect に VNode を渡す
  });
}

// コンポーネントがアンマウントされる際にクリーンアップを実行
export function cleanupHooks(vnode: VNode) {
  if (!vnode || !vnode._hooks) {
    return;
  }
  vnode._hooks.forEach((_hook: any, index: number) => {
    cleanupEffect(vnode, index); // cleanupEffect に VNode を渡す
  });
}

// hookIndex をインクリメントするヘルパー (各フックで使用)
export function incrementHookIndex() {
  currentHookIndex += 1;
}

// 現在のフックの状態とコンポーネントインスタンスを取得するヘルパー
export function getCurrentHookState<T>(): { vnode: VNode; index: number; hooks: T[] } {
  if (!currentProcessingVNode) {
    throw new Error(
      'Hooks can only be called outside of a component rendering phase or without calling prepareHooks.'
    );
  }
  // _hooks が未定義の場合に備えてデフォルトの空配列を使用
  const hooksArray = (currentProcessingVNode._hooks || []) as T[];
  return { vnode: currentProcessingVNode, index: currentHookIndex, hooks: hooksArray };
}

// フックの状態を設定するヘルパー
export function setHookState<T>(index: number, value: T) {
  if (!currentProcessingVNode) {
    throw new Error(
      'Hooks can only be called outside of a component rendering phase or without calling prepareHooks.'
    );
  }
  if (!currentProcessingVNode._hooks) {
    currentProcessingVNode._hooks = [];
  }
  currentProcessingVNode._hooks[index] = value;
}
// currentComponent をエクスポートしていたが、currentProcessingVNode に置き換えたため削除
// export let currentComponent: any = null; // 削除
// hookIndex をエクスポートしていたが、currentHookIndex に置き換えたため削除
// export let hookIndex = 0; // 削除
