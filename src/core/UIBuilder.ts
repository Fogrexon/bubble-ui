import { createElement } from './createElement';
import type { VNode } from './types';

// TODO: Replace with proper type from bubble-ui-style-engine once available
export type Style = Record<string, any>;

/**
 * Builder class for constructing UI element trees in a chainable, Swift-like style.
 * Wraps {@link createElement} and accumulates props/children via method chaining,
 * then converts them to a {@link VNode} via {@link UIBuilder.build}.
 *
 * @example
 * ```ts
 * const node = VStack(
 *   Text('Hello').key('title').style({ fontSize: 24 }),
 * ).key('root').build();
 * ```
 */
export class UIBuilder {
  private type: string;
  private _props: any = {};
  private _children: (UIBuilder | string | number | boolean | null | undefined)[];

  /**
   * @param type - Element type string (e.g. 'VStack', 'Text').
   * @param children - Child builders, text content, or falsy values to be filtered.
   */
  constructor(
    type: string,
    children: (UIBuilder | string | number | boolean | null | undefined)[]
  ) {
    this.type = type;
    this._children = children;
  }

  /**
   * Applies style properties. Multiple calls are merged shallowly.
   * @param styleObj - Style object compatible with {@link Style}.
   */
  style(styleObj: Style) {
    this._props.style = { ...this._props.style, ...styleObj };
    return this;
  }

  /**
   * Sets the reconciler key for this element.
   * @param keyStr - A string or number uniquely identifying this node among siblings.
   */
  key(keyStr: string | number) {
    this._props.key = keyStr;
    return this;
  }

  /**
   * Attaches a click event handler to this element.
   * @param handler - Callback invoked when the element is clicked.
   */
  onClick(handler: () => void) {
    this._props.onClick = handler;
    return this;
  }

  /**
   * Sets an arbitrary prop by name.
   * @param key - Prop name.
   * @param value - Prop value.
   */
  prop(key: string, value: any) {
    this._props[key] = value;
    return this;
  }

  /**
   * Converts the builder tree into a {@link VNode} for use with a renderer.
   * Child builders are recursively built; falsy values are filtered by {@link createElement}.
   */
  build(): VNode {
    const builtChildren = this._children.map((child) =>
      child instanceof UIBuilder ? child.build() : child
    );
    return createElement(this.type, this._props, ...builtChildren);
  }
}
