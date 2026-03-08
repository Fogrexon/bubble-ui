/* eslint-disable max-classes-per-file */
import { createElement } from './createElement';
import type { VNode } from './types';

// TODO: Replace with proper type from bubble-ui-style-engine once available
export type Style = Record<string, any>;

// eslint-disable-next-line no-use-before-define
type ChildInput = UIBuilder | Component<any> | string | number | boolean | null | undefined;

/**
 * Builder class for constructing UI element trees in a chainable style.
 * Wraps {@link createElement} and accumulates props/children via method chaining,
 * then converts them to a {@link VNode} via {@link UIBuilder.build}.
 *
 * @example
 * ```ts
 * new VStack(
 *   new Text('Hello').key('title').style({ fontSize: 24 }),
 * ).key('root').build();
 * ```
 */
export class UIBuilder {
  private type: string;

  private _props: any = {};

  private _children: ChildInput[];

  /**
   * @param type - Element type string (e.g. 'VStack', 'Text').
   * @param children - Child builders, Components, text content, or falsy values to be filtered.
   */
  constructor(type: string, children: ChildInput[]) {
    this.type = type;
    this._children = children;
  }

  /**
   * Applies style properties. Multiple calls are merged shallowly.
   * @param styleObj - Style object compatible with {@link Style}.
   */
  style(styleObj: Style): this {
    this._props.style = { ...this._props.style, ...styleObj };
    return this;
  }

  /**
   * Sets the reconciler key for this element.
   * @param keyStr - A string or number uniquely identifying this node among siblings.
   */
  key(keyStr: string | number): this {
    this._props.key = keyStr;
    return this;
  }

  /**
   * Attaches a click event handler to this element.
   * @param handler - Callback invoked when the element is clicked.
   */
  onClick(handler: () => void): this {
    this._props.onClick = handler;
    return this;
  }

  /**
   * Converts the builder tree into a {@link VNode} for use with a renderer.
   * Child builders and Components are recursively built;
   * falsy values are filtered by {@link createElement}.
   */
  build(): VNode {
    const builtChildren = this._children.map((child) => {
      if (child instanceof UIBuilder) return child.build();
      // eslint-disable-next-line no-use-before-define
      if (child instanceof Component) return child.build();
      return child;
    });
    return createElement(this.type, this._props, ...builtChildren);
  }
}

/**
 * Abstract base class for custom composite components.
 * Extend this class and implement {@link Component.body} to compose
 * built-in elements ({@link VStack}, {@link Text}, etc.) into a reusable component.
 *
 * @typeParam Props - Shape of the props object passed to the constructor.
 *
 * @example
 * ```ts
 * class GreetingCard extends Component<{ name: string }> {
 *   body() {
 *     return new VStack(
 *       new Text(`Hello, ${this.props.name}!`).key('greeting'),
 *     ).key('card-root');
 *   }
 * }
 *
 * new VStack(new GreetingCard({ name: 'World' })).build();
 * ```
 */
export abstract class Component<Props = Record<string, never>> {
  /**
   * Props passed to this component instance.
   * Access via `this.props` inside {@link Component.body}.
   */
  protected props: Props;

  /**
   * @param props - Props object for this component.
   */
  constructor(props: Props) {
    this.props = props;
  }

  /**
   * Defines the element tree for this component.
   * Implement this method to compose built-in elements or other Components.
   */
  abstract body(): UIBuilder;

  /**
   * Converts this component into a {@link VNode} by calling {@link Component.body}
   * and then building the resulting tree.
   */
  build(): VNode {
    return this.body().build();
  }
}
