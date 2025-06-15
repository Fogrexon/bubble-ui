import { VNode } from '../core';

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass {
      render(): Element;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    // Define intrinsic elements (HTML tags)
    // This allows TypeScript to type-check standard HTML elements.
    // For simplicity, we'll allow any props for now.
    // A more robust solution would define specific attributes for each tag.
    interface IntrinsicElements {
      element: {
        // 'element' タグがdivのように振る舞うようにプロパティを定義
        key?: string | number;
        id?: string;
        className?: string;
        style?: Record<string, string | number | undefined>; // CSSPropertiesに近い形
        children?: any; // VNode | string | number | (VNode | string | number)[]など
        // イベントハンドラ (例)
        onClick?: (event: any) => void; // MouseEvent はブラウザ環境依存なので any に変更
        onMouseDown?: (event: any) => void; // MouseEvent はブラウザ環境依存なので any に変更
        // 他のHTML属性も必要に応じて追加
        // src, alt は element が画像などを表す場合に使うが、div相当なら不要かもしれない
        // src?: string;
        // alt?: string;
        [key: string]: any; // その他の任意の属性を許可
      };
      // div: { ... }; // div の定義は削除 (element を使うため)
      // 他のHTML要素もここに追加可能
    }
  }
}
