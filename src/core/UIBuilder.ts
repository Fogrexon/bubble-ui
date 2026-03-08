import { createElement } from './createElement';
import type { VNode } from './types';

// TODO: bubble-ui-style-engine側で正式な方が定義されていればそちらに差し替える
export type Style = Record<string, any>;

export class UIBuilder {
  private type: string;
  private _props: any = {};
  private _children: (UIBuilder | string | number | boolean | null | undefined)[];

  constructor(
    type: string,
    children: (UIBuilder | string | number | boolean | null | undefined)[]
  ) {
    this.type = type;
    this._children = children;
  }

  style(styleObj: Style) {
    this._props.style = { ...this._props.style, ...styleObj };
    return this;
  }

  key(keyStr: string | number) {
    this._props.key = keyStr;
    return this;
  }

  onClick(handler: () => void) {
    this._props.onClick = handler;
    return this;
  }

  // 拡張用：その他の自由なプロパティをセットする場合
  prop(key: string, value: any) {
    this._props[key] = value;
    return this;
  }

  // レンダラーへ渡す際にVNodeツリーへと変換する
  build(): VNode {
    const builtChildren = this._children.map((child) =>
      child instanceof UIBuilder ? child.build() : child
    );
    return createElement(this.type, this._props, ...builtChildren);
  }
}
