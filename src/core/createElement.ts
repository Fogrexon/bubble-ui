import type { Props, VNode } from './types';

/**
 * Creates a VNode specifically for representing text content.
 * @param text The string content.
 * @returns A VNode of type 'PRIMITIVE'.
 */
const createTextVNode = (text: string): VNode => ({
  type: 'PRIMITIVE',
  props: {},
  _text: text,
});

/**
 * Creates a Virtual DOM Node (VNode).
 * Represents a UI element in the virtual tree.
 *
 * @param type The type of the element (e.g., 'View', 'Text', or a custom component function/class).
 * @param props The properties (attributes and event listeners) for the element.
 * @param children Child VNodes or primitive values (string, number).
 * @returns A VNode object.
 */
export const createElement = (
  type: VNode['type'],
  props: Props | null,
  ...children: (VNode | string | number | null)[]
): VNode => {
  const normalizedProps: Props = { ...(props || {}) };

  normalizedProps.children = children
    .flat()
    .filter((child) => child !== null)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? createTextVNode(String(child))
        : child
    );

  return {
    type,
    props: normalizedProps,
    // _id は Differ または Committer によって設定される
    _key: normalizedProps.key,
  };
};
