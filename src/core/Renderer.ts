import type { VNode } from './types';
import type { IComponentResolver } from './reconciler';
import type { IReconciler } from './reconciler/IReconciler';
import type { IRendererAdaptor } from './IRendererAdaptor.ts';
import { createElement } from './createElement'; // createElement をインポート
import { commitHooks, cleanupHooks } from './hooks'; // commitHooks と cleanupHooks をインポート

/**
 * Renderer class for managing the rendering of virtual DOM trees to PixiJS containers.
 * Acts as the main entry point for the rendering system, delegating the actual
 * reconciliation work to the reconciler.
 */
export class Renderer<TargetElement = unknown> {
  private previousVNode: VNode | null = null; // 解決後の previous VNode tree root
  private readonly hostContainer: TargetElement; // 不変のホストコンテナ
  private rootElementType: VNode['type'] | null = null; // 現在のアプリルートの型
  private rootElementProps: VNode['props'] | null = null; // 現在のアプリルートのprops
  private lastAppRootElement: VNode | null = null; // 最後にrenderに渡された解決前のアプリルートVNode

  private reconcilerInstance: IReconciler;

  private componentResolver: IComponentResolver;

  private rendererAdaptor: IRendererAdaptor<TargetElement>;

  /**
   * Creates a Renderer instance with the specified reconciler.
   * @param componentResolver The component resolver to use for resolving components.
   * @param rendererAdaptor The renderer adaptor to use for rendering operations.
   * @param reconciler The reconciler instance to use for diffing and committing changes.
   */
  constructor(
    componentResolver: IComponentResolver,
    rendererAdaptor: IRendererAdaptor<TargetElement>,
    reconciler: IReconciler,
    explicitHostContainer?: TargetElement // オプションで外部からコンテナを指定可能
  ) {
    this.componentResolver = componentResolver;
    this.reconcilerInstance = reconciler;
    this.rendererAdaptor = rendererAdaptor;

    if (explicitHostContainer) {
      this.hostContainer = explicitHostContainer;
      // アダプタにもコンテナを通知 (アダプタが内部でルートコンテナを管理する場合)
      this.rendererAdaptor.setHostMountPoint(this.hostContainer); // 名前変更
    } else {
      this.hostContainer = this.rendererAdaptor.createDefaultHostMountPoint(); // 名前変更
      // createDefaultHostMountPoint内でsetHostMountPointが呼ばれることを期待 (TextAdaptor, DOMAdaptorで実装済み)
    }
  }

  /**
   * Renders the specified VNode tree into the host container.
   * This is the main entry point for the rendering process.
   *
   * @param element The root VNode to render.
   */
  public render(element: VNode | null): void {
    if (!this.hostContainer) {
      // これはコンストラクタで設定されるため、通常発生しないはず
      console.error("Renderer: Host container is not initialized.");
      return;
    }
    
    // アプリケーションのルートVNode情報を保存/更新
    if (element) {
      // 初回またはルートコンポーネントの型が変わった場合にのみtype/propsを更新する方が良いかもしれないが、
      // reRenderRootで使うために常に最新のelementのtype/propsを保存しておく。
      this.rootElementType = element.type;
      this.rootElementProps = element.props;
      this.lastAppRootElement = element; 
    } else {
      // アンマウントの場合、ルート情報をクリアする（あるいは保持したままにするか設計による）
      // this.rootElementType = null;
      // this.rootElementProps = null;
    }
    
    const resolvedVNode =
      element && typeof element.type === 'function'
        ? this.componentResolver.resolveComponent(element, this.reconcilerInstance)
        : element;

    // アンマウント時のクリーンアップ
    if (element === null && this.lastAppRootElement && typeof this.lastAppRootElement.type === 'function') {
      cleanupHooks(this.lastAppRootElement);
    }

    this.reconcilerInstance.reconcile(resolvedVNode, this.previousVNode);

    // マウント・更新後の副作用実行
    if (element && typeof element.type === 'function') {
      commitHooks(element);
    }

    this.previousVNode = resolvedVNode;

    // rendererAdaptor.render() は adaptor が状態を持つ場合に呼び出す想定かもしれない。
    // Committer が adaptor を使って個別の操作を行うので、ここでの一括render呼び出しは不要かもしれない。
    // もし必要なら、adaptor が commitWork の結果を最終的に画面に反映するために呼び出す。
    this.rendererAdaptor.render(); // 呼び出しを復活
  }

  /**
   * Returns the current root VNode being rendered.
   * @returns The current root VNode or null if nothing is rendered.
   */
  public getRootVNode(): VNode | null {
    return this.previousVNode;
  }

  /**
   * Returns the host container this renderer is attached to.
   * @returns The host container or null if not set.
   */
  public getHostContainer(): TargetElement | null {
    return this.hostContainer;
  }

  /**
   * Triggers a re-render of the root component.
   * This method should be called by the Reconciler when an update is scheduled.
   */
  public reRenderRoot(): void {
    if (this.rootElementType && this.rootElementProps && this.hostContainer) {
      // createElement を使って新しいルートVNodeを生成
      // rootElementPropsにはchildrenも含まれている可能性があるため、展開して渡す
      const newRootElement = createElement(
        this.rootElementType,
        this.rootElementProps,
        ...(this.rootElementProps.children || []) // propsからchildrenを渡す
      );

      // もし以前のアプリルートVNodeインスタンスが存在し、型が同じであれば、フックの状態とreconcilerを引き継ぐ
      if (this.lastAppRootElement && this.lastAppRootElement.type === this.rootElementType) {
        newRootElement._hooks = this.lastAppRootElement._hooks;
        newRootElement._reconciler = this.lastAppRootElement._reconciler;
      }
      
      this.render(newRootElement); // container引数は削除された
    } else {
      console.warn("Cannot re-render root, root element information or container not available.");
    }
  }
}
