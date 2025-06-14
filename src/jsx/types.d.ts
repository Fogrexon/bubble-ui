import { VNode } from '../core'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass {
      render(): Element;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    // Define intrinsic elements (HTML tags)
    // This allows TypeScript to type-check standard HTML elements.
    // For simplicity, we'll allow any props for now.
    // A more robust solution would define specific attributes for each tag.
    interface IntrinsicElements {
      element: { src?: string; alt?: string; [key: string]: any };
    }
  }
}
