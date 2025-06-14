import type { VNode } from '../types';
import { prepareHooks } from '../hooks'; // prepareHooks をインポート

/**
 * Interface for component resolution.
 * Responsible for executing function components and resolving them into VNode trees.
 */
export interface IComponentResolver {
  /**
   * Executes a function component and returns the resulting VNode.
   * Handles recursive resolution if a component returns another component.
   * @param vnode The VNode representing the function component.
   * @returns The resolved VNode tree produced by the component, or null if the component returns null or errors.
   */
  resolveComponent(vnode: VNode): VNode | null;
}

/**
 * Implementation class for ComponentResolver.
 * Handles the execution and resolution of function components.
 */
export class ComponentResolver implements IComponentResolver {
  /**
   * Executes a function component and returns its resulting VNode.
   * If the component returns another component, it resolves recursively.
   * @param vnode The VNode representing the function component.
   * @returns The resolved VNode tree, or null if the component returns null or an error occurs.
   */
  resolveComponent(vnode: VNode): VNode | null {
    if (typeof vnode.type === 'function') {
      try {
        // 関数コンポーネントを実行する前に prepareHooks を呼び出す
        prepareHooks(vnode);
        const result = vnode.type(vnode.props);

        if (!result) {
          return null;
        }

        if (typeof result.type === 'function') {
          return this.resolveComponent(result);
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
