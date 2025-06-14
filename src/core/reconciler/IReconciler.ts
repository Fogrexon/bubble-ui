// src/core/reconciler/IReconciler.ts
import type { VNode } from '../types';

/**
 * Interface for the Reconciler.
 * Responsible for the reconciliation process of the virtual DOM tree.
 */
export interface IReconciler {
  /**
   * Performs the reconciliation (diffing and committing) of the virtual DOM tree.
   * @param element The new root virtual DOM element.
   * @param oldVNode The previous root virtual DOM element (null on initial render).
   */
  reconcile(element: VNode | null, oldVNode: VNode | null): void;

  /**
   * Schedules an update for the given VNode.
   * This typically involves re-rendering the component associated with the VNode
   * and its children.
   * @param vnode The VNode that needs to be updated.
   */
  scheduleUpdate(vnode: VNode): void;
}
