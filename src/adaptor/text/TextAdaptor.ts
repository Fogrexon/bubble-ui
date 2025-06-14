/* eslint-disable class-methods-use-this,@typescript-eslint/no-unused-vars,no-param-reassign */
import type { IRendererAdaptor, VNode } from 'bubble-ui';

type TextTargetElement = {
  textContent?: VNode['_text'];
  children?: TextTargetElement[];
  key?: string | number;
}
export class TextAdaptor implements IRendererAdaptor<TextTargetElement> {
  private _rootContainer: TextTargetElement | null = null;

  constructor(rootContainer?: TextTargetElement | null) {
    this._rootContainer = rootContainer || null;
  }

  addEventListener(_element: TextTargetElement, _eventType: string, _listener: Function): void {
    // do nothing
  }

  appendChild(parent: TextTargetElement, child: TextTargetElement): void {
    parent.children?.push(child);
  }

  createElement(vnode: VNode): TextTargetElement {
    return {
      textContent: vnode._text,
      children: [],
      key: vnode._key,
    };
  }

  deleteElement(_element: TextTargetElement, _vnode: VNode): void {
    // do nothing
  }

  dispose(): void {
    // do nothing
  }

  getRootContainer(): TextTargetElement | null {
    return this._rootContainer;
  }

  insertChild(
    parent: TextTargetElement,
    child: TextTargetElement,
    beforeChild: TextTargetElement
  ): void {
    const index = parent.children?.indexOf(beforeChild) ?? -1;
    if (index !== -1) {
      parent.children?.splice(index, 0, child);
    } else {
      parent.children?.push(child); // Fallback to append if beforeChild not found
    }
  }

  removeChild(parent: TextTargetElement, child: TextTargetElement): void {
    const index = parent.children?.indexOf(child) ?? -1;
    if (index !== -1) {
      parent.children?.splice(index, 1);
    }
  }

  removeEventListener(_element: TextTargetElement, _eventType: string, _listener: Function): void {
    // do nothing
  }

  private recursiveRender(element: TextTargetElement, indent: string): void {
    console.log(
      `${indent}Element: ${element.key || 'no-key'}, Text: ${element.textContent || 'no-text'}`
    );
    if (element.children) {
      element.children.forEach((child) => this.recursiveRender(child, `${indent}  `));
    }
  }

  render(): void {
    this.recursiveRender(this._rootContainer || {}, '');
  }

  setRootContainer(container: TextTargetElement | null): void {
    this._rootContainer = container;
  }

  updateElement(element: TextTargetElement, oldVNode: VNode | null, newVNode: VNode): void {
    if (oldVNode) {
      element.textContent = newVNode._text;
      element.key = newVNode._key;
    } else {
      // If oldVNode is null, this is a new element
      element.textContent = newVNode._text;
      element.key = newVNode._key;
      element.children = [];
    }
  }
}