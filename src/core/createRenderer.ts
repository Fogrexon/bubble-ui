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

  const reconciler = new Reconciler(differ, committer);

  return new Renderer(componentResolver, rendererAdaptor, reconciler);
};
