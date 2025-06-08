import { VNode, WorkUnit } from '../types';
import { Committer, ICommitter } from './Committer';
import { IComponentManager } from './ComponentManager';
import { Differ, IDiffer } from './Differ';
import { IEventManager } from './EventManager';
import { IRendererAdaptor } from './IRendererAdaptor';

/**
 * Interface for the Reconciler.
 * Responsible for the reconciliation process of the virtual DOM tree.
 */
export interface IReconciler<TargetElement> {
  /**
   * Performs the reconciliation (diffing and committing) of the virtual DOM tree.
   * @param element The new root virtual DOM element.
   * @param oldVNode The previous root virtual DOM element (null on initial render).
   * @param container The root container element to render into.
   */
  reconcile(element: VNode | null, oldVNode: VNode | null, container: TargetElement): void;
}

/**
 * Implementation class for the Reconciler.
 * Manages the synchronization between the virtual DOM and the actual PixiJS objects.
 * Orchestrates the diffing and committing phases.
 */
export class Reconciler<TargetElement> implements IReconciler<TargetElement> {
  private componentManager: IComponentManager;

  private differ: IDiffer;

  private committer: ICommitter<TargetElement>;

  private rendererAdaptor: IRendererAdaptor<TargetElement>;

  constructor(
    componentManager: IComponentManager,
    differ: IDiffer,
    eventManager: IEventManager, // Keep injection for now, might be needed elsewhere
    rendererAdaptor: IRendererAdaptor<TargetElement>
  ) {
    this.componentManager = componentManager;
    this.differ = differ;
    this.rendererAdaptor = rendererAdaptor;
    this.committer = new Committer<TargetElement>(this.rendererAdaptor);
  }

  /**
   * Performs the reconciliation (diffing and committing) of the virtual DOM tree.
   * If the root element is a component, it resolves the component first.
   * Then, it calculates the differences (WorkUnits) and applies them via the Committer.
   * @param element The new root virtual DOM element.
   * @param oldVNode The previous root virtual DOM element (null on initial render).
   * @param container The root container element to render into.
   */
  reconcile(element: VNode | null, oldVNode: VNode | null, container: TargetElement): void {
    const resolvedElement =
      element && typeof element.type === 'function'
        ? this.componentManager.resolveComponent(element)
        : element;

    const { workUnits, parentVNodeMap } = this.differ.diff(resolvedElement, oldVNode);

    if (resolvedElement) {
      this.committer.setRootElement(resolvedElement, container);
    } else if (oldVNode) {
      // Root element removal is handled by the DELETION work unit for oldVNode.
    }

    this.committer.commitWork(workUnits, parentVNodeMap);
  }
}
