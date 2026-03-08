import type { VNode } from '../types';
import type { IReconciler } from './IReconciler'; // IReconciler をインポート

/**
 * Interface for component resolution.
 * Responsible for instantiating class components and resolving them into VNode trees.
 */
export interface IComponentResolver {
  /**
   * Instantiates a class component and returns the resulting VNode.
   * Handles recursive resolution if a component returns another component.
   * @param vnode The VNode representing the class component.
   * @param reconciler The reconciler instance managing this component tree.
   * @returns The resolved VNode tree produced by the component's body(), or null if errors.
   */
  resolveComponent(vnode: VNode, reconciler: IReconciler): VNode | null;
}

/**
 * Implementation class for ComponentResolver.
 * Handles the instantiation and resolution of class components.
 */
export class ComponentResolver implements IComponentResolver {
  /**
   * Executes a function component and returns its resulting VNode.
   * If the component returns another component, it resolves recursively.
   * @param vnode The VNode representing the function component.
   * @param reconciler The reconciler instance managing this component tree.
   * @returns The resolved VNode tree, or null if the component returns null or an error occurs.
   */
  resolveComponent(vnode: VNode, reconciler: IReconciler): VNode | null {
    if (typeof vnode.type === 'function') {
      // eslint-disable-next-line no-param-reassign
      vnode._reconciler = reconciler;

      try {
        let instance = vnode._instance;

        if (!instance) {
          // Instantiate the component if it doesn't exist
          // eslint-disable-next-line new-cap
          instance = new (vnode.type as any)(vnode.props);
          // eslint-disable-next-line no-param-reassign
          vnode._instance = instance;
        } else {
          // Update props of existing instance
          instance.props = vnode.props;
        }

        // Set the VNode reference on the instance
        instance!._vnode = vnode;

        const uiBuilder = instance!.body();
        const result = uiBuilder.build();

        if (!result) {
          return null;
        }

        // Recursive resolution for nested components
        if (result && typeof result.type === 'function') {
          return this.resolveComponent(result, reconciler);
        }

        return result;
      } catch (error) {
        console.error(`Error resolving component ${vnode.type.name || 'Anonymous'}:`, error);
        return null;
      }
    }

    return vnode;
  }
}
