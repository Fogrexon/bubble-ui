import type { VNode } from '../types';
import { prepareHooks } from '../hooks'; // prepareHooks をインポート
import type { IReconciler } from './IReconciler'; // IReconciler をインポート

/**
 * Interface for component resolution.
 * Responsible for executing function components and resolving them into VNode trees.
 */
export interface IComponentResolver {
  /**
   * Executes a function component and returns the resulting VNode.
   * Handles recursive resolution if a component returns another component.
   * @param vnode The VNode representing the function component.
   * @param reconciler The reconciler instance managing this component tree.
   * @returns The resolved VNode tree produced by the component, or null if the component returns null or errors.
   */
  resolveComponent(vnode: VNode, reconciler: IReconciler): VNode | null;
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
   * @param reconciler The reconciler instance managing this component tree.
   * @returns The resolved VNode tree, or null if the component returns null or an error occurs.
   */
  resolveComponent(vnode: VNode, reconciler: IReconciler): VNode | null {
    if (typeof vnode.type === 'function') {
      // 関数コンポーネントのVNodeにReconcilerインスタンスを設定
      // eslint-disable-next-line no-param-reassign
      vnode._reconciler = reconciler;
      try {
        // 関数コンポーネントを実行する前に prepareHooks を呼び出す
        prepareHooks(vnode);
        const result = vnode.type(vnode.props);

        if (!result) {
          return null;
        }

        // 結果がさらに別の関数コンポーネントの場合、それにもReconcilerインスタンスを伝播させる
        if (result && typeof result.type === 'function') {
          // result._reconciler = reconciler; // ここで設定するのは、resultが新しいVNodeインスタンスの場合。
          // createElementで生成される際にreconcilerが設定される方が良いかもしれない。
          // または、この再帰呼び出しの中で設定される。
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
