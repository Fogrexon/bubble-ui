import type { IReconciler } from './reconciler/IReconciler'; // 新しいIReconcilerをインポート

// eslint-disable-next-line no-use-before-define
export type ElementType = string | FunctionNode;

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

  // Hooks related properties
  _hooks?: any[]; // Stores the state of hooks for this VNode
  // _internalId?: symbol; // A unique internal ID for the component instance if VNode is reused across renders
  _reconciler?: IReconciler; // Reference to the Reconciler instance
}

/**
 * Function component type
 */
// eslint-disable-next-line no-use-before-define
export type FunctionNode<P = {}> = (props: P & { children?: VNode[] }) => VNode | null;

/**
 * Work unit for reconciler
 */
export interface WorkUnit {
  vnode: VNode;
  effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  alternate?: VNode | null;
  nextSibling?: VNode | null;
}

// for jsx function component
// @ts-ignore
// eslint-disable-next-line no-undef
export type BubbleFC<P = {}> = (props: P) => JSX.Element | null;
