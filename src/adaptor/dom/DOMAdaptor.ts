// src/adaptor/dom/DOMAdaptor.ts
import type { IRendererAdaptor, VNode, Props } from '../../core'; // coreから型をインポート

// DOMアダプタが扱う要素の型 (HTMLElementまたはTextノード)
export type DOMNode = HTMLElement | Text;

export class DOMAdaptor implements IRendererAdaptor<DOMNode> {
  private rootContainer: HTMLElement | null = null;

  // --- IRendererAdaptorの実装 ---

  createDefaultHostMountPoint(): HTMLElement {
    // 名前変更
    const defaultRoot = document.createElement('div');
    defaultRoot.id = 'bubble-ui-default-root'; // 識別用ID
    if (document.body) {
      // document.body が利用可能な環境か確認
      document.body.appendChild(defaultRoot);
    } else {
      // body がない環境 (例: Node.jsでのテストなど) のためのフォールバックや警告
      console.warn(
        'DOMAdaptor: document.body is not available. Default root element will not be appended to the body.'
      );
    }
    this.setHostMountPoint(defaultRoot); // 名前変更
    return defaultRoot;
  }

  displayAppRootOnHost(appRootElement: DOMNode | null): void {
    const mountPoint = this.getHostMountPoint();
    if (mountPoint) {
      // 既存の内容をクリア
      while (mountPoint.firstChild) {
        mountPoint.removeChild(mountPoint.firstChild);
      }
      // 新しいアプリケーションルート要素を追加 (nullでない場合)
      if (appRootElement) {
        mountPoint.appendChild(appRootElement);
      }
    } else {
      console.warn('DOMAdaptor: Host mount point is not set. Cannot display app root.');
    }
  }

  createElement(vnode: VNode): DOMNode {
    if (vnode.type === 'PRIMITIVE') {
      return document.createTextNode(
        vnode._text === null || vnode._text === undefined ? '' : String(vnode._text)
      );
    }
    if (typeof vnode.type === 'string') {
      // vnode.type が 'element' の場合、HTMLの 'div' 要素として扱う
      if (vnode.type.toLowerCase() === 'element') {
        const element = document.createElement('div');
        // 初期プロパティ設定 (例: id, className, styleなど)
        this.updateElementProperties(element, {}, vnode.props);
        return element;
      }
      // 'element' 以外の文字列型は未サポートとする (またはvnode.typeをそのままタグ名として使うか選択)
      // 今回は「Divだけで良い」という指示なので、'element'以外は警告し、divとしてフォールバックする
      console.warn(
        `DOMAdaptor: Unsupported element type "${vnode.type}". Treating as 'div' by default for <element> tag, or as a fallback.`
      );
      const element = document.createElement('div');
      // ユーザーが <element type="actualTag"> のように使うことを想定しないなら、
      // typeが'element'でない場合はエラーにする方が明確かもしれない。
      // ここでは、JSXで<element>と書かれたものが'element'というtypeで来る前提。
      element.textContent = `Unsupported type: ${vnode.type}, rendered as div.`;
      return element;
    }
    // 関数コンポーネントやクラスコンポーネントはReconciler/ComponentResolverが解決するため、
    // AdaptorのcreateElementに渡されるvnode.typeは通常文字列のはず。
    throw new Error(`DOMAdaptor: Cannot create element for VNode type: ${String(vnode.type)}`);
  }

  updateElement(element: DOMNode, oldVNode: VNode | null, newVNode: VNode): void {
    if (element instanceof Text) {
      if (newVNode._text !== element.textContent) {
        // eslint-disable-next-line no-param-reassign
        element.textContent =
          newVNode._text === null || newVNode._text === undefined ? '' : String(newVNode._text);
      }
      return;
    }
    // HTMLElementの場合
    if (element instanceof HTMLElement) {
      this.updateElementProperties(element, oldVNode?.props || {}, newVNode.props);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private updateElementProperties(element: HTMLElement, oldProps: Props, newProps: Props): void {
    // Remove old properties
    Object.keys(oldProps).forEach((key) => {
      if (!(key in newProps) && key !== 'children' && key !== 'key') {
        if (key.startsWith('on') && typeof oldProps[key] === 'function') {
          element.removeEventListener(
            key.substring(2).toLowerCase(),
            oldProps[key] // Removed 'as EventListener'
          );
        } else if (key === 'style' && oldProps.style && typeof oldProps.style === 'object') {
          Object.keys(oldProps.style).forEach((styleKey) => {
            // eslint-disable-next-line no-param-reassign
            (element.style as any)[styleKey] = '';
          });
        } else {
          element.removeAttribute(key);
        }
      }
    });

    // Set new or changed properties
    Object.keys(newProps).forEach((key) => {
      if (key !== 'children' && key !== 'key' && newProps[key] !== oldProps[key]) {
        if (key.startsWith('on') && typeof newProps[key] === 'function') {
          if (typeof oldProps[key] === 'function') {
            element.removeEventListener(
              key.substring(2).toLowerCase(),
              oldProps[key] // Removed 'as EventListener'
            );
          }
          element.addEventListener(key.substring(2).toLowerCase(), newProps[key] as EventListener);
        } else if (
          key === 'style' &&
          typeof newProps.style === 'object' &&
          newProps.style !== null
        ) {
          const { style } = newProps;
          Object.keys(style).forEach((styleKey) => {
            // eslint-disable-next-line no-param-reassign
            (element.style as any)[styleKey] = (style as any)[styleKey];
          });
        } else if (key === 'className') {
          // eslint-disable-next-line no-param-reassign
          element.className = newProps[key] as string;
        } else if (key === 'id') {
          // eslint-disable-next-line no-param-reassign
          element.id = newProps[key] as string;
        } else {
          // eslint-disable-next-line no-param-reassign
          element.setAttribute(key, String(newProps[key]));
        }
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  appendChild(parent: DOMNode, child: DOMNode): void {
    if (parent instanceof HTMLElement) {
      parent.appendChild(child);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  insertChild(parent: DOMNode, child: DOMNode, beforeChild: DOMNode): void {
    if (parent instanceof HTMLElement) {
      parent.insertBefore(child, beforeChild);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  removeChild(parent: DOMNode, child: DOMNode): void {
    if (parent instanceof HTMLElement) {
      try {
        parent.removeChild(child);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        // console.warn('Failed to remove child, it might have already been removed.', child, parent);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  deleteElement(element: DOMNode, _vnode: VNode): void {
    if (element.parentNode) {
      // element.parentNode.removeChild(element); // This might be redundant if removeChild is always called before
    }
  }

  getHostMountPoint(): HTMLElement | null {
    return this.rootContainer;
  }

  setHostMountPoint(container: HTMLElement | null): void {
    this.rootContainer = container;
  }

  // eslint-disable-next-line class-methods-use-this
  render(): void {
    // DOM Adaptorでは通常不要。ブラウザが自動でレンダリングする。
  }

  // eslint-disable-next-line class-methods-use-this
  addEventListener(element: DOMNode, eventType: string, listener: Function): void {
    if (element instanceof HTMLElement) {
      element.addEventListener(eventType, listener as EventListener);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  removeEventListener(element: DOMNode, eventType: string, listener: EventListener): void {
    if (element instanceof HTMLElement) {
      element.removeEventListener(eventType, listener); // Removed 'as EventListener'
    }
  }

  dispose(): void {
    if (this.rootContainer) {
      this.rootContainer = null;
    }
  }
}
