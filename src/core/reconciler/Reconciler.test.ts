/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Reconciler } from './Reconciler';
import { Differ } from './Differ';
import { Committer } from './Committer';
import { Component } from '../Component';
import { UIBuilder } from '../UIBuilder';
import { createElement } from '../createElement';
import type { VNode } from '../types';

/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
describe('Reconciler', () => {
  let reconciler: Reconciler;
  let mockAdaptor: any;

  beforeEach(() => {
    mockAdaptor = {
      createElement: vi.fn((vnode) => ({ id: vnode._id, type: vnode.type })),
      updateElement: vi.fn(),
      deleteElement: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      displayAppRootOnHost: vi.fn(),
      getHostMountPoint: vi.fn(() => null),
    };

    const differ = new Differ();
    const committer = new Committer(mockAdaptor);
    reconciler = new Reconciler(differ, committer);
    reconciler.setRendererContext({
      reRenderRoot: vi.fn(),
    });
  });

  const createVNode = (type: any, props: any = {}): VNode =>
    ({
      type,
      props: { ...props, children: props.children || [] },
      _key: props.key,
    }) as VNode;

  it('should perform initial reconciliation', () => {
    const root = createVNode('div');
    reconciler.reconcile(root, null);

    expect(mockAdaptor.createElement).toHaveBeenCalled();
    expect(mockAdaptor.displayAppRootOnHost).toHaveBeenCalled();
  });

  it('should handle scheduleUpdate for components', () => {
    class MyComp {
      public props: any;

      public state: any;

      public _vnode: any;

      constructor(props: any) {
        this.props = props;
      }

      body() {
        return { build: () => createVNode('div') };
      }
    }

    const vnode = createVNode(MyComp);
    vnode._instance = new MyComp({});
    vnode._instance._vnode = vnode;
    vnode._reconciler = reconciler;

    reconciler.reconcile(vnode, null);
    vi.clearAllMocks();

    const mockReRender = vi.fn();
    reconciler.setRendererContext({
      reRenderRoot: mockReRender,
    });

    reconciler.scheduleUpdate(vnode);

    // Should trigger re-render request to the renderer
    expect(mockReRender).toHaveBeenCalled();
  });

  it('should persist state across re-renders in Differ', () => {
    class MyComp extends Component<{}, { count: number }> {
      constructor(props: {}) {
        super(props);
        this.state = { count: 0 };
      }

      increment() {
        this.setState({ count: this.state.count + 1 });
      }

      body(): UIBuilder {
        return {
          build: () =>
            ({
              type: 'div',
              props: { text: `Count: ${this.state.count}`, children: [] },
            }) as VNode,
        } as UIBuilder;
      }
    }

    const differ = new Differ();
    const vnode1 = createElement(MyComp, { key: 'same-key' });
    // Simulate first render assignment
    vnode1._id = 'test-id';
    const instance = new MyComp({ key: 'same-key' });
    instance.state = { count: 10 };
    vnode1._instance = instance;

    const vnode2 = createElement(MyComp, { key: 'same-key' });

    differ.diff(vnode2, vnode1);

    // Instance and ID should be propagated
    expect(vnode2._id).toBe('test-id');
    expect(vnode2._instance).toBe(instance);
    expect(vnode2._instance!.state.count).toBe(10);
  });
});
