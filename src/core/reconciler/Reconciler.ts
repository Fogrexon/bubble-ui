import type { VNode } from '../types';
import { type ICommitter } from './Committer';
import type { IDiffer } from './Differ';
import type { IReconciler } from './IReconciler'; // IReconciler をインポート

/**
 * Implementation class for the Reconciler.
 * Manages the synchronization between the virtual DOM and the actual PixiJS objects.
 * Orchestrates the diffing and committing phases.
 */
export class Reconciler implements IReconciler {
  private differ: IDiffer;

  private committer: ICommitter;

  private currentRootVNode: VNode | null = null;

  // Rendererへの参照を保持する
  private renderer: {
    // getRootElement は scheduleUpdate 内で直接は使われなくなったが、
    // Renderer がルート情報を管理するために依然として重要。
    // getHostContainer も同様。
    reRenderRoot: () => void; // Rendererのルート再レンダリング実行メソッド
  } | null = null; // 初期値はnullとし、後から設定する

  constructor(
    differ: IDiffer,
    committer: ICommitter
    // hostContainer と renderFunction は削除し、代わりに setRenderer で設定
  ) {
    this.differ = differ;
    this.committer = committer;
  }

  // Rendererインスタンスを設定するメソッド
  public setRendererContext(rendererContext: { reRenderRoot: () => void }) {
    this.renderer = rendererContext;
  }

  private propagateReconcilerInstance(vnode: VNode | null, reconcilerInstance: IReconciler) {
    if (!vnode) return;
    // eslint-disable-next-line no-param-reassign
    vnode._reconciler = reconcilerInstance;
    if (vnode._children) {
      vnode._children.forEach((child) => {
        this.propagateReconcilerInstance(child, reconcilerInstance);
      });
    }
    // Function componentが返すVNodeにも設定が必要な場合があるが、
    // createElementで生成されるVNodeに初期設定されるか、resolveComponent後に設定するか検討。
    // ここでは、与えられたツリー構造に対して設定する。
  }

  reconcile(newVNode: VNode | null, oldVNode: VNode | null): void {
    if (newVNode) {
      this.currentRootVNode = newVNode;
      this.propagateReconcilerInstance(this.currentRootVNode, this);
    } else {
      this.currentRootVNode = null;
    }

    const { workUnits, parentVNodeMap } = this.differ.diff(newVNode, oldVNode);
    this.committer.commitWork(workUnits, parentVNodeMap);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scheduleUpdate(_vnodeToUpdate: VNode): void {
    // console.log('scheduleUpdate called for VNode:', vnodeToUpdate);

    if (!this.renderer) {
      // console.warn('Cannot schedule update, renderer context is not set on Reconciler.');
      return;
    }
    // this.renderer が null でないことを確認したので、以降は安全にアクセスできる
    // const hostContainer = this.renderer.getHostContainer(); // reRenderRoot内で処理
    // const rootElement = this.renderer.getRootElement(); // reRenderRoot内で処理

    // if (!hostContainer || !rootElement) { // reRenderRoot内で処理
    //   console.warn('Cannot schedule update, host container or root element is not available via renderer context.');
    //   return;
    // }

    // Rendererにルートの再レンダリングを依頼する
    this.renderer.reRenderRoot();
  }
}
