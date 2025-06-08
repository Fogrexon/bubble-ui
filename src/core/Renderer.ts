import { Application, Container } from 'pixi.js';
import { VNode, RenderTarget } from './types';
import { IReconciler } from './reconciler';

/**
 * Renderer class for managing the rendering of virtual DOM trees to PixiJS containers.
 * Acts as the main entry point for the rendering system, delegating the actual
 * reconciliation work to the reconciler.
 */
export class Renderer<TargetElement = Container> {
  private rootVNode: VNode | null = null;

  private rootContainer: TargetElement | null = null;

  private reconcilerInstance: IReconciler<TargetElement>;

  /**
   * Creates a Renderer instance with the specified reconciler.
   * @param reconciler The reconciler instance to use for diffing and committing changes.
   */
  constructor(reconciler: IReconciler<TargetElement>) {
    this.reconcilerInstance = reconciler;
  }

  /**
   * Renders the specified virtual DOM tree to the given PixiJS container.
   * This is the main entry point for the rendering process.
   *
   * @param element The root virtual DOM element to render.
   * @param container The target PixiJS container for rendering.
   */
  public render(element: VNode | null, container: RenderTarget): void {
    const targetContainer = container instanceof Application ? container.stage : container;

    this.reconcilerInstance.reconcile(
      element,
      this.rootVNode,
      targetContainer as unknown as TargetElement
    );

    this.rootVNode = element;
    this.rootContainer = element ? (targetContainer as unknown as TargetElement) : null;
  }

  /**
   * Returns the current root VNode being rendered.
   * @returns The current root VNode or null if nothing is rendered.
   */
  public getRootVNode(): VNode | null {
    return this.rootVNode;
  }

  /**
   * Returns the current root container where the UI is being rendered.
   * @returns The current root container or null if nothing is rendered.
   */
  public getRootContainer(): TargetElement | null {
    return this.rootContainer;
  }
}
