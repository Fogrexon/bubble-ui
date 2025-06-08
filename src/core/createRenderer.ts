import { Container } from 'pixi.js';
import {
  Reconciler,
  ComponentManager,
  Differ,
  EventManager,
  IRendererAdaptor
} from './reconciler';
import { Renderer } from './Renderer';

/**
 * Creates a renderer instance with all necessary dependencies configured.
 * @returns A configured Renderer instance.
 */
export const createRenderer = <TargetElement = Container>
  (rendererAdaptor: IRendererAdaptor<TargetElement>): Renderer<TargetElement> => {
  const eventManager = new EventManager();
  const componentManager = new ComponentManager();
  const differ = new Differ();

  const reconciler = new Reconciler<TargetElement>(
    componentManager,
    differ,
    eventManager,
    rendererAdaptor
  );

  return new Renderer<TargetElement>(reconciler);
}
