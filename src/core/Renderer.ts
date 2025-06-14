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
  private hostContainer: TargetElement | null = null; // ホストコンテナを保持
  private rootElementType: VNode['type'] | null = null; // ルート要素の型
  private rootElementProps: VNode['props'] | null = null; // ルート要素のprops
  private lastRootElementInstance: VNode | null = null; // 最後にrenderに渡された解決前のルート要素インスタンス

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
    reconciler: IReconciler
  ) {
    this.componentResolver = componentResolver;
    this.reconcilerInstance = reconciler;
    this.rendererAdaptor = rendererAdaptor;
  }

  /**
   * Renders the specified virtual DOM tree to the given PixiJS container.
   * This is the main entry point for the rendering process.
   *
   * @param newVNode The root newVNode to render.
   * @param container The host container to render into. If not provided, a default root will be created by the adaptor.
   */
  public render(element: VNode | null, container?: TargetElement): void {
    if (container) {
      this.hostContainer = container;
    } else if (!this.hostContainer) {
      // コンテナが提供されず、かつ内部にもまだホストコンテナがない場合、アダプタにデフォルトを作成させる
      this.hostContainer = this.rendererAdaptor.createDefaultRootElement();
      // アダプタ側で setRootContainer も呼ばれる想定 (TextAdaptorではcreateDefaultRootElement内で呼んでいる)
    }

    if (!this.hostContainer) {
      console.error("Renderer: Host container is not set and could not be created by adaptor.");
      return;
    }
    
    // 初回レンダリング時または要素が指定された場合にルート情報を保存
    if (element) { // element が null (アンマウント) でない場合
      if (this.rootElementType === null || this.rootElementProps === null || this.lastRootElementInstance === null) {
        this.rootElementType = element.type;
        this.rootElementProps = element.props;
      }
      this.lastRootElementInstance = element; // 最後にrenderに渡されたelementを保存
    } else {
      // アンマウント時はルート情報をクリアしてもよいが、reRenderRootのためには保持しておく必要がある場合も。
      // ここでは lastRootElementInstance はクリアしない。
    }
    
    const resolvedVNode =
      element && typeof element.type === 'function'
        ? this.componentResolver.resolveComponent(element, this.reconcilerInstance)
        : element;

    // アンマウント時のクリーンアップ (elementがnullで、かつ以前のルートが関数コンポーネントだった場合)
    // this.previousVNode は解決後のツリーなので、フックを持つ元の関数コンポーネントVNodeは this.lastRootElementInstance
    if (element === null && this.lastRootElementInstance && typeof this.lastRootElementInstance.type === 'function') {
      cleanupHooks(this.lastRootElementInstance);
    }

    this.reconcilerInstance.reconcile(resolvedVNode, this.previousVNode);

    // マウント・更新後の副作用実行
    // element が元の関数コンポーネントVNode
    if (element && typeof element.type === 'function') {
      commitHooks(element);
    }

    this.previousVNode = resolvedVNode; // previousVNode は解決後のツリーを指す

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

      // もし以前のルート関数コンポーネントインスタンスが存在し、型が同じであれば、フックの状態とreconcilerを引き継ぐ
      if (this.lastRootElementInstance && this.lastRootElementInstance.type === this.rootElementType) {
        newRootElement._hooks = this.lastRootElementInstance._hooks;
        // _reconciler は ComponentResolver で設定されるので、ここで明示的に引き継ぐ必要はないかもしれない。
        // ただし、ComponentResolver を通らないパスがあるなら必要。
        // ComponentResolver を通るなら、新しいインスタンスにも設定されるはず。
        // 安全のため、または ComponentResolver を通らないケースを考慮して引き継ぐ。
        newRootElement._reconciler = this.lastRootElementInstance._reconciler;
      }
      
      this.render(newRootElement, this.hostContainer);
    } else {
      console.warn("Cannot re-render root, root element information or container not available.");
    }
  }
}
