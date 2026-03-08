import type { Component } from './Component';
import type { IReconciler } from './reconciler/IReconciler';

// eslint-disable-next-line no-use-before-define
export type ElementType = string | { new (props: any): Component<any, any> };

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

  // Component instance reference
  _instance?: Component<any, any>; // Stores the instance of a ClassComponent

  // _internalId?: symbol; // A unique internal ID for the component instance if VNode is reused across renders
  _reconciler?: IReconciler; // Reference to the Reconciler instance
}

/**
 * Work unit for reconciler
 */
export interface WorkUnit {
  vnode: VNode;
  effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  alternate?: VNode | null;
  nextSibling?: VNode | null;
}
