// eslint-disable-next-line no-use-before-define
export type ElementType = string | FunctionComponent;

/**
 * Property interface
 */
export interface Props {
  key?: string | number;
  [key: string]: any;
  // eslint-disable-next-line no-use-before-define
  children?: VNode[];
  style?: Record<string, any>;
}

/**
 * Virtual DOM node
 */
export interface VNode {
  type: ElementType;
  props: Props;
  _id?: string; // VNodeの一意な識別子 (オプショナル)

  _key?: Props['key'];

  // for plaintext content
  _text?: string | number | null;

  _children?: VNode[];
  sibling?: VNode | null; // Pointer to the next sibling VNode
}

/**
 * Function component type
 */
export type FunctionComponent<P = {}> = (props: P & { children?: VNode[] }) => VNode | null;

/**
 * Work unit for reconciler
 */
export interface WorkUnit {
  vnode: VNode;
  effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  alternate?: VNode | null;
  nextSibling?: VNode | null;
}
