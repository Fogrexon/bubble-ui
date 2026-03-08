import { UIBuilder } from './UIBuilder';

/**
 * Creates a generic UI element builder with an arbitrary type string.
 * @param type - The element type identifier (e.g. 'VStack', 'Text').
 * @param children - Child builders, text content, or falsy values.
 */
export const Element = (
  type: string,
  ...children: (UIBuilder | string | number | boolean | null | undefined)[]
) => {
  return new UIBuilder(type, children);
};

/**
 * Creates a vertically stacked container element (maps to 'VStack' type).
 * Suitable for future pixi.js/yoga-layout column layout.
 * @param children - Child builders or text content.
 */
export const VStack = (
  ...children: (UIBuilder | string | number | boolean | null | undefined)[]
) => {
  // 後にpixi/yogaで適切なタイプマッピング等を行う前提
  return Element('VStack', ...children);
};

/**
 * Creates a horizontally stacked container element (maps to 'HStack' type).
 * Suitable for future pixi.js/yoga-layout row layout.
 * @param children - Child builders or text content.
 */
export const HStack = (
  ...children: (UIBuilder | string | number | boolean | null | undefined)[]
) => {
  return Element('HStack', ...children);
};

/**
 * Creates a text element builder.
 * @param content - The string or number to display.
 */
export const Text = (content: string | number) => {
  return Element('Text', content);
};
