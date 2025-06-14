import type { VNode } from '../types';
import { type ICommitter } from './Committer';
import type { IComponentManager } from './ComponentManager';
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
  private componentManager: IComponentManager;

  private differ: IDiffer;

  private committer: ICommitter;

  constructor(
    componentManager: IComponentManager,
    differ: IDiffer,
    committer: ICommitter,
  ) {
    this.componentManager = componentManager;
    this.differ = differ;
    this.committer = committer
  }

  /**
   * Performs the reconciliation (diffing and committing) of the virtual DOM tree.
   * If the root element is a component, it resolves the component first.
   * Then, it calculates the differences (WorkUnits) and applies them via the Committer.
   * @param element The new root virtual DOM element.
   * @param oldVNode The previous root virtual DOM element (null on initial render).
   */
  reconcile(element: VNode | null, oldVNode: VNode | null): void {
    const resolvedElement =
      element && typeof element.type === 'function'
        ? this.componentManager.resolveComponent(element)
        : element;

    const { workUnits, parentVNodeMap } = this.differ.diff(resolvedElement, oldVNode);

    this.committer.commitWork(workUnits, parentVNodeMap);
  }
}
