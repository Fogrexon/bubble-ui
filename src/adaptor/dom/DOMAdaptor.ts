// src/adaptor/dom/DOMAdaptor.ts
import type { IRendererAdaptor, VNode, Props } from '../../core'; // coreから型をインポート

// DOMアダプタが扱う要素の型 (HTMLElementまたはTextノード)
export type DOMNode = HTMLElement | Text;

export class DOMAdaptor implements IRendererAdaptor<DOMNode> {
  private rootContainer: HTMLElement | null = null;

  constructor() {
    // DOMAdaptorは通常、既存のDOM要素をルートコンテナとして指定されるか、
    // createDefaultRootElementでbody直下にdivなどを作成する。
  }

  // --- IRendererAdaptorの実装 ---

  createDefaultHostMountPoint(): HTMLElement { // 名前変更
    const defaultRoot = document.createElement('div');
    defaultRoot.id = 'bubble-ui-default-root'; // 識別用ID
    if (document.body) { // document.body が利用可能な環境か確認
      document.body.appendChild(defaultRoot);
    } else {
      // body がない環境 (例: Node.jsでのテストなど) のためのフォールバックや警告
      console.warn("DOMAdaptor: document.body is not available. Default root element will not be appended to the body.");
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
      console.warn("DOMAdaptor: Host mount point is not set. Cannot display app root.");
    }
  }

  createElement(vnode: VNode): DOMNode {
    if (vnode.type === 'PRIMITIVE') {
      return document.createTextNode(vnode._text === null || vnode._text === undefined ? '' : String(vnode._text));
    }
    if (typeof vnode.type === 'string') {
      // vnode.type が 'element' の場合、HTMLの 'div' 要素として扱う
      if (vnode.type.toLowerCase() === 'element') {
        const element = document.createElement('div');
        // 初期プロパティ設定 (例: id, className, styleなど)
        this.updateElementProperties(element, {}, vnode.props);
        return element;
      } else {
        // 'element' 以外の文字列型は未サポートとする (またはvnode.typeをそのままタグ名として使うか選択)
        // 今回は「Divだけで良い」という指示なので、'element'以外は警告し、divとしてフォールバックする
        console.warn(`DOMAdaptor: Unsupported element type "${vnode.type}". Treating as 'div' by default for <element> tag, or as a fallback.`);
        const element = document.createElement('div');
        // ユーザーが <element type="actualTag"> のように使うことを想定しないなら、
        // typeが'element'でない場合はエラーにする方が明確かもしれない。
        // ここでは、JSXで<element>と書かれたものが'element'というtypeで来る前提。
        element.textContent = `Unsupported type: ${vnode.type}, rendered as div.`;
        return element;
      }
    }
    // 関数コンポーネントやクラスコンポーネントはReconciler/ComponentResolverが解決するため、
    // AdaptorのcreateElementに渡されるvnode.typeは通常文字列のはず。
    throw new Error(`DOMAdaptor: Cannot create element for VNode type: ${String(vnode.type)}`);
  }

  updateElement(element: DOMNode, oldVNode: VNode | null, newVNode: VNode): void {
    if (element instanceof Text) {
      if (newVNode._text !== element.textContent) {
        element.textContent = newVNode._text === null || newVNode._text === undefined ? '' : String(newVNode._text);
      }
      return;
    }
    // HTMLElementの場合
    if (element instanceof HTMLElement) {
        this.updateElementProperties(element, oldVNode?.props || {}, newVNode.props);
        // テキストコンテンツの直接設定 (VNodeがPRIMITIVEでないがテキストを持つ場合、通常は子としてPRIMITIVE VNodeがあるべき)
        // ただし、<div>text</div> のようなJSXは、'text'が子VNodeとして扱われる。
        // ここでは主に属性やスタイルの更新を行う。
        // もしvnodeが直接テキストを持つdivなら (例: <div _text="hello">)、ここで設定も可能だが、
        // 通常のJSXではchildren経由になる。
        // if (newVNode._text !== undefined && newVNode._text !== null && element.childNodes.length === 0) {
        //   element.textContent = String(newVNode._text);
        // }
    }
  }
  
  private updateElementProperties(element: HTMLElement, oldProps: Props, newProps: Props): void {
    // Remove old properties
    for (const key in oldProps) {
      if (!(key in newProps) && key !== 'children' && key !== 'key') {
        if (key.startsWith('on') && typeof oldProps[key] === 'function') {
          element.removeEventListener(key.substring(2).toLowerCase(), oldProps[key]);
        } else if (key === 'style') {
          // スタイル全削除は難しいので、個別にリセットするか、新しいスタイルで上書きする
          for (const styleKey in oldProps.style) {
            (element.style as any)[styleKey] = '';
          }
        } else {
          element.removeAttribute(key);
        }
      }
    }

    // Set new or changed properties
    for (const key in newProps) {
      if (key !== 'children' && key !== 'key' && newProps[key] !== oldProps[key]) {
        if (key.startsWith('on') && typeof newProps[key] === 'function') {
          if (typeof oldProps[key] === 'function') { // Remove old listener if it exists and is different
            element.removeEventListener(key.substring(2).toLowerCase(), oldProps[key]);
          }
          element.addEventListener(key.substring(2).toLowerCase(), newProps[key]);
        } else if (key === 'style' && typeof newProps.style === 'object') {
          const style = newProps.style;
          for (const styleKey in style) {
            (element.style as any)[styleKey] = style[styleKey];
          }
        } else if (key === 'className') {
            element.className = newProps[key] as string;
        } else if (key === 'id') {
            element.id = newProps[key] as string;
        } else {
          // その他HTML属性
          element.setAttribute(key, String(newProps[key]));
        }
      }
    }
  }

  appendChild(parent: DOMNode, child: DOMNode): void {
    console.log('DOMAdaptor: appendChild called', parent, child);
    if (parent instanceof HTMLElement) { // Textノードは子を持てない
      parent.appendChild(child);
    }
  }

  insertChild(parent: DOMNode, child: DOMNode, beforeChild: DOMNode): void {
    if (parent instanceof HTMLElement) {
      parent.insertBefore(child, beforeChild);
    }
  }

  removeChild(parent: DOMNode, child: DOMNode): void {
    if (parent instanceof HTMLElement) {
      try {
        parent.removeChild(child);
      } catch (e) {
        // console.warn('Failed to remove child, it might have already been removed.', child, parent);
      }
    }
  }

  deleteElement(element: DOMNode, _vnode: VNode): void {
    // DOMから削除するのはremoveChildの役割。ここでは特別なクリーンアップがあれば。
    // イベントリスナなどはupdateElementで処理される。
    if (element.parentNode) {
        // console.warn('deleteElement called for an element that is still in the DOM. This should have been removed by removeChild.', element);
        //念のため削除
        // element.parentNode.removeChild(element);
    }
  }
  
  getHostMountPoint(): HTMLElement | null { // 名前変更
    return this.rootContainer;
  }

  setHostMountPoint(container: HTMLElement | null): void { // 名前変更
    this.rootContainer = container;
  }

  render(): void {
    // DOM Adaptorでは通常不要。ブラウザが自動でレンダリングする。
  }

  addEventListener(element: DOMNode, eventType: string, listener: Function): void {
    if (element instanceof HTMLElement) {
      element.addEventListener(eventType, listener as EventListener);
    }
  }

  removeEventListener(element: DOMNode, eventType: string, listener: Function): void {
    if (element instanceof HTMLElement) {
      element.removeEventListener(eventType, listener as EventListener);
    }
  }

  dispose(): void {
    // 必要であれば、イベントリスナーの全解除など
    if (this.rootContainer) {
        // this.rootContainer.innerHTML = ''; // 簡単なクリーンアップ
        this.rootContainer = null;
    }
  }
}
