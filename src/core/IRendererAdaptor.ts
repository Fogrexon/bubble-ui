import type { VNode } from './types.ts';

/**
 * Interface for the rendering adaptor.
 * Acts as a bridge between the core diffing/commit logic and a specific rendering engine.
 */
export interface IRendererAdaptor<TargetElement = unknown> {
  /**
   * Renders the current state of the UI.
   * This method will be called by the reconciler after changes have been committed.
   */
  render(): void;

  /**
   * Cleans up resources used by the rendering engine.
   * Called when the application is unmounted or the renderer is destroyed.
   */
  dispose?(): void;
  /**
   * Creates a native element instance corresponding to the specified VNode type.
   * @param vnode VNode containing type and initial properties.
   * @returns The created native element.
   */
  createElement(vnode: VNode): TargetElement;

  /**
   * Updates the properties (styles, attributes, event listeners, etc.) of a native element.
   * @param element The native element to update.
   * @param oldVNode The previous VNode (null on initial render).
   * @param newVNode The new VNode.
   */
  updateElement(element: TargetElement, oldVNode: VNode | null, newVNode: VNode): void; // Allow null for oldVNode

  /**
   * Appends a child element to a parent element.
   * @param parent The native parent element.
   * @param child The native child element to append.
   */
  appendChild(parent: TargetElement, child: TargetElement): void;

  /**
   * Inserts a new child element before a specific existing child element within a parent.
   * @param parent The native parent element.
   * @param child The native child element to insert.
   * @param beforeChild The native child element before which to insert.
   */
  insertChild(parent: TargetElement, child: TargetElement, beforeChild: TargetElement): void;

  /**
   * Removes a child element from a parent element.
   * @param parent The native parent element.
   * @param child The native child element to remove.
   */
  removeChild(parent: TargetElement, child: TargetElement): void;

  /**
   * Adds an event listener to a native element.
   * @param element The target native element.
   * @param eventType The event type (e.g., 'click', 'pointerdown').
   * @param listener The callback function.
   */
  addEventListener(element: TargetElement, eventType: string, listener: Function): void;

  /**
   * Removes an event listener from a native element.
   * @param element The target native element.
   * @param eventType The event type.
   * @param listener The callback function.
   */
  removeEventListener(element: TargetElement, eventType: string, listener: Function): void;

  /**
   * Gets the root container element for the rendering target.
   * @returns The native root container element.
   */
  getRootContainer(): TargetElement | null;

  /**
   * Sets the root container element for the rendering target.
   * This is typically called when initializing the renderer or changing the root container.
   * @param container The native root container element to set.
   */
  setRootContainer(container: TargetElement | null): void;

  /**
   * Deletes a native element instance.
   * This is called when a VNode is removed from the tree.
   * @param element The native element to delete.
   * @param vnode The VNode corresponding to the element being deleted.
   */
  deleteElement(element: TargetElement, vnode: VNode): void;

  /**
   * Creates a default root element for the rendering target.
   * This can be used if no explicit container is provided to the renderer.
   * @returns The created default root element.
   */
  createDefaultRootElement(): TargetElement;
}
