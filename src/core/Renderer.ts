import type { VNode } from './types';
import type { IReconciler } from './reconciler';
import type { IRendererAdaptor } from './IRendererAdaptor.ts';

/**
 * Renderer class for managing the rendering of virtual DOM trees to PixiJS containers.
 * Acts as the main entry point for the rendering system, delegating the actual
 * reconciliation work to the reconciler.
 */
export class Renderer<TargetElement = unknown> {
  private rootVNode: VNode | null = null;

  private reconcilerInstance: IReconciler;

  private rendererAdaptor: IRendererAdaptor<TargetElement>;

  /**
   * Creates a Renderer instance with the specified reconciler.
   * @param reconciler The reconciler instance to use for diffing and committing changes.
   * @param rendererAdaptor
   */
  constructor(reconciler: IReconciler, rendererAdaptor: IRendererAdaptor<TargetElement>) {
    this.reconcilerInstance = reconciler;
    this.rendererAdaptor = rendererAdaptor;
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

    this.rendererAdaptor.render()
  }

  /**
   * Returns the current root VNode being rendered.
   * @returns The current root VNode or null if nothing is rendered.
   */
  public getRootVNode(): VNode | null {
    return this.rootVNode;
  }
}
