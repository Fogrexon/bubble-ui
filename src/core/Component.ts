import type { VNode } from './types';
import type { UIBuilder } from './UIBuilder';

/**
 * Abstract base class for class-based components.
 */
export abstract class Component<P = {}, S = {}> {
  public props: P;

  public state: S;

  // Internal reference to the VNode
  public _vnode: VNode | null = null;

  constructor(props: P) {
    this.props = props;
    this.state = {} as S; // Should be initialized in subclass
  }

  /**
   * Updates the component state and schedules a re-render.
   * @param newState Partial state update
   */
  public setState(newState: Partial<S>): void {
    this.state = { ...this.state, ...newState };
    if (this._vnode && this._vnode._reconciler) {
      this._vnode._reconciler.scheduleUpdate(this._vnode);
    }
  }

  /**
   * Defines the UI structure of the component.
   */
  public abstract body(): UIBuilder;
}
