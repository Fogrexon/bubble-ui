/* eslint-disable no-console, class-methods-use-this, @typescript-eslint/no-unused-vars, no-param-reassign */
import type { IRendererAdaptor, VNode } from 'bubble-ui';

type TextTargetElement = {
  textContent?: VNode['_text'];
  children?: TextTargetElement[];
  key?: string | number;
};
export class TextAdaptor implements IRendererAdaptor<TextTargetElement> {
  private _rootContainer: TextTargetElement | null = null;

  constructor(rootContainer?: TextTargetElement | null) {
    this._rootContainer = rootContainer || null;
  }

  addEventListener(_element: TextTargetElement, _eventType: string, _listener: Function): void {
    // do nothing
  }

  private removeChildFromWhereverItIs(childToFind: TextTargetElement): void {
    if (!this._rootContainer) return;

    const findAndRemove = (
      currentParent: TextTargetElement,
      target: TextTargetElement
    ): boolean => {
      if (!currentParent.children) return false;
      const index = currentParent.children.indexOf(target);
      if (index !== -1) {
        currentParent.children.splice(index, 1);
        return true; // 見つけて削除した
      }
      // 子要素を再帰的に探索
      return currentParent.children.some((child) => findAndRemove(child, target));
    };

    // ルートから探索を開始するが、ルート自身が親になることはないので、
    // ルートの直接の子から探索するか、あるいはルートが子を持つ場合にルートを探索対象の親として渡す。
    // ここでは、ルートが子を持つ場合に、ルートを最初の探索対象の親として渡す。
    if (this._rootContainer.children && this._rootContainer !== childToFind) {
      // childToFind がルート自身であるケースは稀だが念のため
      findAndRemove(this._rootContainer, childToFind);
    }
  }

  appendChild(parent: TextTargetElement, child: TextTargetElement): void {
    this.removeChildFromWhereverItIs(child); // まず既存の場所から削除
    parent.children = parent.children || []; // childrenがなければ初期化
    parent.children.push(child);
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
    this.removeChildFromWhereverItIs(child); // まず既存の場所から削除
    parent.children = parent.children || []; // childrenがなければ初期化
    const index = parent.children.indexOf(beforeChild);
    if (index !== -1) {
      parent.children.splice(index, 0, child);
    } else {
      parent.children.push(child); // Fallback to append if beforeChild not found
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
    if (this._rootContainer) {
      this.recursiveRender(this._rootContainer, '');
    }
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
