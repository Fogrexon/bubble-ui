import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest';
import { Committer, type ICommitter } from './Committer';
import type { IRendererAdaptor } from '../IRendererAdaptor';
import type { VNode, WorkUnit } from '../types';

// Mock IRendererAdaptor
const mockAdaptor: Mocked<IRendererAdaptor<string>> = {
  createElement: vi.fn((vnode) => `element_for_${vnode.type as string}_${vnode._id}`),
  updateElement: vi.fn(),
  deleteElement: vi.fn(),
  appendChild: vi.fn(),
  insertChild: vi.fn(),
  removeChild: vi.fn(),
  getHostMountPoint: vi.fn(() => null),
  setHostMountPoint: vi.fn(),
  render: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  createDefaultHostMountPoint: vi.fn(() => 'default_host_mount_point_string'),
  displayAppRootOnHost: vi.fn(),
};

describe('Committer', () => {
  let committer: ICommitter;
  let parentVNodeMap: WeakMap<VNode, VNode>;

  beforeEach(() => {
    vi.clearAllMocks();
    committer = new Committer<string>(mockAdaptor);
    parentVNodeMap = new WeakMap();
  });

  // Helper to create a VNode
  const createVNode = (
    id: string,
    type: string | any,
    props: Record<string, any> = {},
    children: VNode[] = []
  ): VNode =>
    ({
      _id: id,
      type,
      props: { ...props, children },
      _key: props.key || id,
    }) as VNode;

  // Helper to create a WorkUnit
  const createWorkUnit = (
    effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION',
    vnode: VNode,
    alternate: VNode | null = null,
    nextSibling: WorkUnit['nextSibling'] = null
  ): WorkUnit => ({
    vnode,
    alternate,
    effectTag,
    nextSibling,
  });

  describe('commitWork', () => {
    it('should process deletions, then updates, then placements', () => {
      const vnode1 = createVNode('id1', 'div');
      const vnode2 = createVNode('id2', 'p');
      const vnode3 = createVNode('id3', 'span');

      const deletionWork: WorkUnit = createWorkUnit('DELETION', vnode1);
      const updateWork: WorkUnit = createWorkUnit('UPDATE', vnode2, createVNode('id2_alt', 'p'));
      const placementWork: WorkUnit = createWorkUnit('PLACEMENT', vnode3);

      const workUnits: WorkUnit[] = [placementWork, deletionWork, updateWork];

      (committer as any).nativeNodeIdMap.set(vnode1._id!, 'element_for_div_id1');
      (committer as any).nativeNodeIdMap.set(
        createVNode('id2_alt', 'p')._id!,
        'element_for_p_id2_alt'
      );

      committer.commitWork(workUnits, parentVNodeMap);

      expect(mockAdaptor.deleteElement).toHaveBeenCalledTimes(1);
      expect(mockAdaptor.updateElement).toHaveBeenCalledTimes(1);
      expect(mockAdaptor.displayAppRootOnHost).toHaveBeenCalledTimes(1);
    });
  });

  describe('commitPlacement', () => {
    it('should place a new root element', () => {
      const vnode = createVNode('root1', 'div');
      const workUnit = createWorkUnit('PLACEMENT', vnode);

      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.createElement).toHaveBeenCalledWith(vnode);
      expect(mockAdaptor.displayAppRootOnHost).toHaveBeenCalledWith('element_for_div_root1');
    });

    it('should place a new child element', () => {
      const parentVNode = createVNode('parent1', 'div');
      const childVNode = createVNode('child1', 'p');
      parentVNodeMap.set(childVNode, parentVNode);

      (committer as any).nativeNodeIdMap.set('parent1', 'element_for_div_parent1');

      const workUnit = createWorkUnit('PLACEMENT', childVNode);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.createElement).toHaveBeenCalledWith(childVNode);
      expect(mockAdaptor.appendChild).toHaveBeenCalledWith(
        'element_for_div_parent1',
        'element_for_p_child1'
      );
    });
  });

  describe('commitUpdate', () => {
    it('should update an existing element', () => {
      const oldVNode = createVNode('update1_old', 'div', { text: 'old' });
      const newVNode = createVNode('update1_new', 'div', { text: 'new' });

      (committer as any).nativeNodeIdMap.set('update1_old', 'element_for_div_update1_old');

      const workUnit = createWorkUnit('UPDATE', newVNode, oldVNode);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.updateElement).toHaveBeenCalledWith(
        'element_for_div_update1_old',
        oldVNode,
        newVNode
      );
    });
  });

  describe('commitDeletion', () => {
    it('should delete an existing element and remove from parent', () => {
      const parentVNode = createVNode('parentDel1', 'div');
      const vnodeToDelete = createVNode('delete1', 'p');
      parentVNodeMap.set(vnodeToDelete, parentVNode);

      (committer as any).nativeNodeIdMap.set('parentDel1', 'element_for_div_parentDel1');
      (committer as any).nativeNodeIdMap.set('delete1', 'element_for_p_delete1');

      const workUnit = createWorkUnit('DELETION', vnodeToDelete);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.removeChild).toHaveBeenCalledWith(
        'element_for_div_parentDel1',
        'element_for_p_delete1'
      );
      expect(mockAdaptor.deleteElement).toHaveBeenCalledWith(
        'element_for_p_delete1',
        vnodeToDelete
      );
    });
  });
});
