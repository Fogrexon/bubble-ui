import type { VNode } from './types';
import type { IComponentResolver, IReconciler } from './reconciler';
import type { IRendererAdaptor } from './IRendererAdaptor.ts';

/**
 * Renderer class for managing the rendering of virtual DOM trees to PixiJS containers.
 * Acts as the main entry point for the rendering system, delegating the actual
 * reconciliation work to the reconciler.
 */
export class Renderer<TargetElement = unknown> {
  private previousVNode: VNode | null = null;

  private reconcilerInstance: IReconciler;

  private componentResolver: IComponentResolver;

  private rendererAdaptor: IRendererAdaptor<TargetElement>;

  /**
   * Creates a Renderer instance with the specified reconciler.
   * @param componentResolver The component resolver to use for resolving components.
   * @param rendererAdaptor The renderer adaptor to use for rendering operations.
   * @param reconciler The reconciler instance to use for diffing and committing changes.
   */
  constructor(
    componentResolver: IComponentResolver,
    rendererAdaptor: IRendererAdaptor<TargetElement>,
    reconciler: IReconciler
  ) {
    this.componentResolver = componentResolver;
    this.reconcilerInstance = reconciler;
    this.rendererAdaptor = rendererAdaptor;
  }

  /**
   * Renders the specified virtual DOM tree to the given PixiJS container.
   * This is the main entry point for the rendering process.
   *
   * @param newVNode The root newVNode to render.
   */
  public render(newVNode: VNode | null): void {
    const resolvedVNode =
      newVNode && typeof newVNode.type === 'function'
        ? this.componentResolver.resolveComponent(newVNode)
        : newVNode;

    this.reconcilerInstance.reconcile(resolvedVNode, this.previousVNode);

    this.previousVNode = resolvedVNode;

    this.rendererAdaptor.render();
  }

  /**
   * Returns the current root VNode being rendered.
   * @returns The current root VNode or null if nothing is rendered.
   */
  public getRootVNode(): VNode | null {
    return this.previousVNode;
  }
}
