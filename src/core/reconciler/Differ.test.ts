import { describe, it, expect, beforeEach } from 'vitest';
import { Differ } from './Differ';
import type { VNode } from '../types';

describe('Differ', () => {
  let differ: Differ;

  beforeEach(() => {
    differ = new Differ();
  });

  const createVNode = (type: any, props?: any, key?: string): VNode =>
    ({
      type,
      props: { ...props, children: props?.children || [] },
      _key: key || props?.key,
    }) as VNode;

  it('should generate PLACEMENT for new node', () => {
    const newNode = createVNode('div');
    const { workUnits } = differ.diff(newNode, null);

    expect(workUnits).toHaveLength(1);
    expect(workUnits[0].effectTag).toBe('PLACEMENT');
    expect(workUnits[0].vnode).toBe(newNode);
    expect(newNode._id).toBeDefined();
  });

  it('should generate DELETION for removed node', () => {
    const oldNode = createVNode('div');
    oldNode._id = 'old-id';
    const { workUnits } = differ.diff(null, oldNode);

    expect(workUnits).toHaveLength(1);
    expect(workUnits[0].effectTag).toBe('DELETION');
    expect(workUnits[0].vnode).toBe(oldNode);
  });

  it('should generate UPDATE when props change', () => {
    const oldNode = createVNode('div', { id: 'old' });
    oldNode._id = 'same-id';
    const newNode = createVNode('div', { id: 'new' });

    const { workUnits } = differ.diff(newNode, oldNode);

    expect(workUnits).toHaveLength(1);
    expect(workUnits[0].effectTag).toBe('UPDATE');
    expect(workUnits[0].vnode).toBe(newNode);
    expect(newNode._id).toBe('same-id');
  });

  it('should generate DELETION and PLACEMENT when types change', () => {
    const oldNode = createVNode('div');
    oldNode._id = 'old-id';
    const newNode = createVNode('span');

    const { workUnits } = differ.diff(newNode, oldNode);

    expect(workUnits).toHaveLength(2);
    expect(workUnits.some((w) => w.effectTag === 'DELETION')).toBe(true);
    expect(workUnits.some((w) => w.effectTag === 'PLACEMENT')).toBe(true);
  });

  it('should identify class component type as same if it is the same class', () => {
    class MyComp { }
    const oldNode = createVNode(MyComp);
    oldNode._id = 'comp-id';
    const newNode = createVNode(MyComp);

    const { workUnits } = differ.diff(newNode, oldNode);
    // No change if props are same (empty)
    expect(workUnits).toHaveLength(0);
    expect(newNode._id).toBe('comp-id');
  });
});
