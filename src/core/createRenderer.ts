import { Reconciler, ComponentManager, Differ, Committer } from './reconciler';
import type { IRendererAdaptor } from './IRendererAdaptor';
import { Renderer } from './Renderer';

/**
 * Creates a renderer instance with all necessary dependencies configured.
 * @returns A configured Renderer instance.
 */
export const createRenderer = <TargetElement>(
  rendererAdaptor: IRendererAdaptor<TargetElement>
): Renderer => {
  const componentManager = new ComponentManager();
  const differ = new Differ();
  const committer = new Committer(rendererAdaptor);

  const reconciler = new Reconciler(
    componentManager,
    differ,
    committer
  );

  return new Renderer(reconciler);
};
