import { createElement } from './createElement';
import type { VNode } from './types';

// TODO: Replace with proper type from bubble-ui-style-engine once available
export type Style = Record<string, any>;

// eslint-disable-next-line no-use-before-define
type ChildInput = UIBuilder | string | number | boolean | null | undefined;

/**
 * A Proxy-wrapped UIBuilder.
 * Known methods (`style`, `key`, `onClick`, `build`) are preserved.
 * Any other property access yields a setter method: `element.id("foo")` sets `props.id = "foo"`.
 */
// eslint-disable-next-line no-use-before-define
export type UIElement = UIBuilder & Record<string, (value: any) => UIElement>;

/**
 * Creates a Proxy over a UIBuilder instance so that any unknown property access
 * returns a function that sets the corresponding prop and returns the proxy.
 * @internal
 */
// eslint-disable-next-line no-use-before-define
export function asUIElement(builder: UIBuilder): UIElement {
  const proxy: UIElement = new Proxy(builder, {
    get(target, prop: string | symbol) {
      if (prop in target) {
        const val = (target as any)[prop];
        return typeof val === 'function' ? val.bind(proxy) : val;
      }
      if (typeof prop === 'string') {
        return (value: any) => {
          // eslint-disable-next-line no-param-reassign
          (target as any)._props[prop] = value;
          return proxy;
        };
      }
      return undefined;
    },
  }) as UIElement;
  return proxy;
}

/**
 * Builder class for constructing UI element trees in a chainable style.
 * Wraps {@link createElement} and accumulates props/children via method chaining,
 * then converts them to a {@link VNode} via {@link UIBuilder.build}.
 *
 * Do not instantiate directly. Use the provided component classes
 * ({@link VStack}, {@link HStack}, {@link Text}, {@link Element}) which
 * return Proxy-wrapped instances ({@link UIElement}) for dynamic prop setting.
 *
 * @example
 * ```ts
 * new VStack(
 *   new Text('Hello').key('title').style({ fontSize: 24 }).id('title-id'),
 * ).key('root').build();
 * ```
 */
export class UIBuilder {
  private type: string;

  private _props: any = {};

  // eslint-disable-next-line no-use-before-define
  private _children: ChildInput[];

  /**
   * @param type - Element type string (e.g. 'VStack', 'Text').
   * @param children - Child builders, text content, or falsy values to be filtered.
   */
  constructor(type: string, children: ChildInput[]) {
    this.type = type;
    this._children = children;
  }

  /**
   * Applies style properties. Multiple calls are merged shallowly.
   * @param styleObj - Style object compatible with {@link Style}.
   */
  style(styleObj: Style): UIElement {
    this._props.style = { ...this._props.style, ...styleObj };
    return asUIElement(this);
  }

  /**
   * Sets the reconciler key for this element.
   * @param keyStr - A string or number uniquely identifying this node among siblings.
   */
  key(keyStr: string | number): UIElement {
    this._props.key = keyStr;
    return asUIElement(this);
  }

  /**
   * Attaches a click event handler to this element.
   * @param handler - Callback invoked when the element is clicked.
   */
  onClick(handler: () => void): UIElement {
    this._props.onClick = handler;
    return asUIElement(this);
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
