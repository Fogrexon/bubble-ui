import type { VNode } from '../types';
import { type ICommitter } from './Committer';
import type { IDiffer } from './Differ';

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
}

/**
 * Implementation class for the Reconciler.
 * Manages the synchronization between the virtual DOM and the actual PixiJS objects.
 * Orchestrates the diffing and committing phases.
 */
export class Reconciler implements IReconciler {
  private differ: IDiffer;

  private committer: ICommitter;

  constructor(differ: IDiffer, committer: ICommitter) {
    this.differ = differ;
    this.committer = committer;
  }

  /**
   * Performs the reconciliation (diffing and committing) of the virtual DOM tree.
   * If the root newVNode is a component, it resolves the component first.
   * Then, it calculates the differences (WorkUnits) and applies them via the Committer.
   * @param newVNode The new root virtual DOM newVNode.
   * @param oldVNode The previous root virtual DOM newVNode (null on initial render).
   */
  reconcile(newVNode: VNode | null, oldVNode: VNode | null): void {
    const { workUnits, parentVNodeMap } = this.differ.diff(newVNode, oldVNode);

    this.committer.commitWork(workUnits, parentVNodeMap);
  }
}
