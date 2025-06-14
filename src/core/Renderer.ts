import type { VNode } from './types';
import type { IReconciler } from './reconciler';

/**
 * Renderer class for managing the rendering of virtual DOM trees to PixiJS containers.
 * Acts as the main entry point for the rendering system, delegating the actual
 * reconciliation work to the reconciler.
 */
export class Renderer {
  private rootVNode: VNode | null = null;

  private reconcilerInstance: IReconciler;

  /**
   * Creates a Renderer instance with the specified reconciler.
   * @param reconciler The reconciler instance to use for diffing and committing changes.
   */
  constructor(reconciler: IReconciler) {
    this.reconcilerInstance = reconciler;
  }

  /**
   * Renders the specified virtual DOM tree to the given PixiJS container.
   * This is the main entry point for the rendering process.
   *
   * @param element The root virtual DOM element to render.
   */
  public render(element: VNode | null): void {

    this.reconcilerInstance.reconcile(
      element,
      this.rootVNode,
    );

    this.rootVNode = element;
  }

  /**
   * Returns the current root VNode being rendered.
   * @returns The current root VNode or null if nothing is rendered.
   */
  public getRootVNode(): VNode | null {
    return this.rootVNode;
  }
}
