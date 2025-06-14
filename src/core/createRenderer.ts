import { Reconciler, ComponentResolver, Differ, Committer } from './reconciler';
import type { IRendererAdaptor } from './IRendererAdaptor';
import { Renderer } from './Renderer';

/**
 * Creates a renderer instance with all necessary dependencies configured.
 * @returns A configured Renderer instance.
 */
export const createRenderer = <TargetElement>(
  rendererAdaptor: IRendererAdaptor<TargetElement>
): Renderer => {
  const componentResolver = new ComponentResolver();
  const differ = new Differ();
  const committer = new Committer(rendererAdaptor);

  // Reconcilerのインスタンス化 (コンストラクタ引数が変更された)
  const reconciler = new Reconciler(differ, committer);

  // Rendererのインスタンス化
  const rendererInstance = new Renderer(componentResolver, rendererAdaptor, reconciler);

  // ReconcilerにRendererのコンテキストを設定
  // RendererクラスがReconcilerの期待するインターフェースを提供する必要がある
  reconciler.setRendererContext({
    reRenderRoot: () => rendererInstance.reRenderRoot()
  });

  return rendererInstance;
};
