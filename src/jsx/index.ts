/* eslint-disable no-param-reassign */
import { createElement, type VNode } from '../core';

const Fragment = Symbol.for("Fragment");

// For the new JSX transform
function jsx(type: VNode["type"] | typeof Fragment, props: VNode["props"], key?: VNode["_key"]): VNode | VNode[] {

  if (type === Fragment) {
    // If the type is Fragment, we return the children directly without a wrapper.
    // This is a special case for React's Fragment.
    if (!props) {
      return [];
    }
    return props.children || [];
  }
  // key is not used in this simple implementation but is part of the expected signature
  if (key !== undefined) {
    // If you want to handle keys, you can add them to props or handle them separately.
    // For simplicity, we'll merge it into props if it exists.
    if (props === null || props === undefined) {
      props = { key };
    } else {
      props.key = key;
    }
  }
  return createElement(type, props, ...(props.children || []));
}

// For the new JSX transform, we also need to support the `jsxs` function
// which is similar to `jsx` but allows for multiple children without needing to wrap them in an array.
// This is useful for cases where you want to return multiple elements from a component.
// In this simple implementation, `jsxs` behaves the same as `jsx`.
const jsxs = jsx

export { Fragment, jsx, jsxs };
