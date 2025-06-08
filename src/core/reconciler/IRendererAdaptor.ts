import { VNode } from '../types';

/**
 * Interface for the rendering adaptor.
 * Acts as a bridge between the core diffing/commit logic and a specific rendering engine.
 */
export interface IRendererAdaptor<TargetElement = unknown> {
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
     * Sets the text content of a native element (primarily for text nodes).
     * @param element The target native text element.
     * @param text The new text content.
     */
    setTextContent(element: TargetElement, text: string): void;

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
     * Gets or sets the root container element for the rendering target.
     * @param container The native root container element (if setting).
     * @returns The native root container element.
     */
    getRootContainer(container?: TargetElement): TargetElement;
}
