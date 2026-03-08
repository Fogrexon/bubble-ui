/* eslint-disable max-classes-per-file */
import { UIBuilder, asUIElement, type UIElement } from './UIBuilder';

type ChildInput = UIBuilder | string | number | boolean | null | undefined;

/**
 * A vertically stacked container element.
 * Suitable for pixi.js/yoga-layout column layout (renders as 'VStack' type).
 *
 * @example
 * ```ts
 * new VStack(
 *   new Text('Hello').key('title'),
 * ).key('root').style({ padding: 16 }).build();
 * ```
 */
export class VStack extends UIBuilder {
  constructor(...children: ChildInput[]) {
    super('VStack', children);
    // eslint-disable-next-line no-constructor-return
    return asUIElement(this) as unknown as VStack;
  }
}

/**
 * A horizontally stacked container element.
 * Suitable for pixi.js/yoga-layout row layout (renders as 'HStack' type).
 */
export class HStack extends UIBuilder {
  constructor(...children: ChildInput[]) {
    super('HStack', children);
    // eslint-disable-next-line no-constructor-return
    return asUIElement(this) as unknown as HStack;
  }
}

/**
 * A text element.
 * @param content - The string or number to display.
 */
export class Text extends UIBuilder {
  constructor(content: string | number) {
    super('Text', [content]);
    // eslint-disable-next-line no-constructor-return
    return asUIElement(this) as unknown as Text;
  }
}

/**
 * A generic UI element with an arbitrary type string.
 * Use when you need a type that is not covered by the built-in components.
 */
export class Element extends UIBuilder {
  constructor(type: string, ...children: ChildInput[]) {
    super(type, children);
    // eslint-disable-next-line no-constructor-return
    return asUIElement(this) as unknown as Element;
  }
}

export type { UIElement };
