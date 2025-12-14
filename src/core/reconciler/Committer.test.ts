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
  getHostMountPoint: vi.fn(() => null), // 名前変更
  setHostMountPoint: vi.fn(), // 名前変更
  render: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  createDefaultHostMountPoint: vi.fn(() => 'default_host_mount_point_string'), // 名前変更
  displayAppRootOnHost: vi.fn(), // 追加
  // dispose is optional
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
    type: string | Function,
    props: Record<string, any> = {},
    children: VNode[] = []
  ): VNode =>
    ({
      _id: id,
      type,
      props: { ...props, children },
      _key: props.key || id, // Ensure key for testing if needed
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
      // For PLACEMENT, vnode3 (id3) will be a new root.
      // This will call displayAppRootOnHost in the current Committer logic.
      expect(mockAdaptor.displayAppRootOnHost).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();
      const vnodeDel = createVNode('del1', 'div');
      const vnodeUpd = createVNode('upd1', 'p');
      const vnodePla = createVNode('pla1', 'span');
      const alternateUpd = createVNode('upd1_alt', 'p');

      (committer as any).nativeNodeIdMap.set(vnodeDel._id!, 'element_for_div_del1');
      (committer as any).nativeNodeIdMap.set(alternateUpd._id!, 'element_for_p_upd1_alt');
      mockAdaptor.getHostMountPoint.mockReturnValue(null); // Ensure pla1 is a new root

      const workUnitsOrderedExecution = [
        createWorkUnit('DELETION', vnodeDel),
        createWorkUnit('UPDATE', vnodeUpd, alternateUpd),
        createWorkUnit('PLACEMENT', vnodePla),
      ];
      committer.commitWork(workUnitsOrderedExecution, parentVNodeMap);

      expect(mockAdaptor.deleteElement).toHaveBeenCalledWith('element_for_div_del1', vnodeDel);
      expect(mockAdaptor.updateElement).toHaveBeenCalledWith(
        'element_for_p_upd1_alt',
        alternateUpd,
        vnodeUpd
      );
      expect(mockAdaptor.displayAppRootOnHost).toHaveBeenCalledWith('element_for_span_pla1');
    });
  });

  describe('commitPlacement', () => {
    it('should place a new root element', () => {
      const vnode = createVNode('root1', 'div');
      const workUnit = createWorkUnit('PLACEMENT', vnode);

      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.createElement).toHaveBeenCalledWith(vnode);
      expect(mockAdaptor.updateElement).not.toHaveBeenCalled();
      expect(mockAdaptor.displayAppRootOnHost).toHaveBeenCalledWith('element_for_div_root1');
      expect(mockAdaptor.appendChild).not.toHaveBeenCalled();
      expect(mockAdaptor.insertChild).not.toHaveBeenCalled();
    });

    it('should place a new child element', () => {
      const parentVNode = createVNode('parent1', 'div');
      const childVNode = createVNode('child1', 'p');
      parentVNodeMap.set(childVNode, parentVNode);

      (committer as any).nativeNodeIdMap.set('parent1', 'element_for_div_parent1');
      mockAdaptor.getHostMountPoint.mockReturnValue('some_other_root'); // 名前変更

      const workUnit = createWorkUnit('PLACEMENT', childVNode);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.createElement).toHaveBeenCalledWith(childVNode);
      expect(mockAdaptor.updateElement).toHaveBeenCalledWith(
        'element_for_p_child1',
        null,
        childVNode
      );
      expect(mockAdaptor.appendChild).toHaveBeenCalledWith(
        'element_for_div_parent1',
        'element_for_p_child1'
      );
      expect(mockAdaptor.insertChild).not.toHaveBeenCalled();
      expect(mockAdaptor.displayAppRootOnHost).not.toHaveBeenCalled();
    });

    it('should place a new child element before a sibling', () => {
      const parentVNode = createVNode('parent2', 'div');
      const childVNode = createVNode('child2', 'p');
      const siblingVNode = createVNode('sibling2', 'span');
      parentVNodeMap.set(childVNode, parentVNode);
      parentVNodeMap.set(siblingVNode, parentVNode);

      (committer as any).nativeNodeIdMap.set('parent2', 'element_for_div_parent2');
      (committer as any).nativeNodeIdMap.set('sibling2', 'element_for_span_sibling2');
      mockAdaptor.getHostMountPoint.mockReturnValue('some_other_root'); // 名前変更

      const workUnit = createWorkUnit('PLACEMENT', childVNode, null, siblingVNode);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.createElement).toHaveBeenCalledWith(childVNode);
      expect(mockAdaptor.updateElement).toHaveBeenCalledWith(
        'element_for_p_child2',
        null,
        childVNode
      );
      expect(mockAdaptor.insertChild).toHaveBeenCalledWith(
        'element_for_div_parent2',
        'element_for_p_child2',
        'element_for_span_sibling2'
      );
      expect(mockAdaptor.appendChild).not.toHaveBeenCalled();
    });

    it('should move an existing element to a new position as a child', () => {
      const parentVNode = createVNode('parentMove', 'div');
      const vnodeToMove = createVNode('nodeToMoveNewId', 'span', { text: 'new' });
      const oldVNodeToMove = createVNode('nodeToMoveOldId', 'span', { text: 'old' });
      parentVNodeMap.set(vnodeToMove, parentVNode);

      (committer as any).nativeNodeIdMap.set('parentMove', 'element_for_div_parentMove');
      (committer as any).nativeNodeIdMap.set('nodeToMoveOldId', 'element_for_span_nodeToMoveOldId');
      mockAdaptor.getHostMountPoint.mockReturnValue('some_other_root'); // 名前変更

      const workUnit = createWorkUnit('PLACEMENT', vnodeToMove, oldVNodeToMove);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.createElement).not.toHaveBeenCalledWith(vnodeToMove);
      expect(mockAdaptor.updateElement).toHaveBeenCalledWith(
        'element_for_span_nodeToMoveOldId',
        oldVNodeToMove,
        vnodeToMove
      );
      expect(mockAdaptor.appendChild).toHaveBeenCalledWith(
        'element_for_div_parentMove',
        'element_for_span_nodeToMoveOldId'
      );
      expect((committer as any).nativeNodeIdMap.get('nodeToMoveNewId')).toBe(
        'element_for_span_nodeToMoveOldId'
      );
      if (vnodeToMove._id !== oldVNodeToMove._id) {
        expect((committer as any).nativeNodeIdMap.has(oldVNodeToMove._id!)).toBe(true);
      } else {
        expect((committer as any).nativeNodeIdMap.has(oldVNodeToMove._id!)).toBe(true);
      }
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
      if (newVNode._id !== oldVNode._id) {
        expect((committer as any).nativeNodeIdMap.get(newVNode._id!)).toBe(
          'element_for_div_update1_old'
        );
        expect((committer as any).nativeNodeIdMap.has(oldVNode._id!)).toBe(false);
      }
    });

    it('should handle update if element not found for alternate ID but found for new VNode ID (fallback)', () => {
      const oldVNode = createVNode('updateFallback_old', 'div');
      const newVNode = createVNode('updateFallback_new', 'div');

      (committer as any).nativeNodeIdMap.set(newVNode._id!, 'element_for_div_updateFallback_new');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const workUnit = createWorkUnit('UPDATE', newVNode, oldVNode);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Cannot commit update: Element not found for alternate ID',
        'updateFallback_old',
        oldVNode
      );
      expect(mockAdaptor.updateElement).toHaveBeenCalledWith(
        'element_for_div_updateFallback_new',
        oldVNode,
        newVNode
      );
      consoleErrorSpy.mockRestore();
    });

    it('should log error if element not found for update', () => {
      const oldVNode = createVNode('updateMissing_old', 'div');
      const newVNode = createVNode('updateMissing_new', 'div');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const workUnit = createWorkUnit('UPDATE', newVNode, oldVNode);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.updateElement).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      consoleErrorSpy.mockRestore();
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
      expect((committer as any).nativeNodeIdMap.has('delete1')).toBe(false);
    });

    it('should delete a root element', () => {
      const vnodeToDelete = createVNode('deleteRoot1', 'div');
      (committer as any).nativeNodeIdMap.set('deleteRoot1', 'element_for_div_deleteRoot1');
      mockAdaptor.getHostMountPoint.mockReturnValue('element_for_div_deleteRoot1'); // 名前変更

      const workUnit = createWorkUnit('DELETION', vnodeToDelete);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.displayAppRootOnHost).toHaveBeenCalledWith(null);
      expect(mockAdaptor.deleteElement).toHaveBeenCalledWith(
        'element_for_div_deleteRoot1',
        vnodeToDelete
      );
      expect((committer as any).nativeNodeIdMap.has('deleteRoot1')).toBe(false);
      expect(mockAdaptor.removeChild).not.toHaveBeenCalled();
    });

    it('should recursively delete child elements from map', () => {
      const parentVNode = createVNode('delParentRecursive', 'div');
      const child1 = createVNode('delChild1Recursive', 'p');
      const grandchild1 = createVNode('delGrandchild1Recursive', 'span');
      child1.props.children = [grandchild1];
      parentVNode.props.children = [child1];
      parentVNodeMap.set(child1, parentVNode);

      (committer as any).nativeNodeIdMap.set(
        'delParentRecursive',
        'element_for_div_delParentRecursive'
      );
      (committer as any).nativeNodeIdMap.set(
        'delChild1Recursive',
        'element_for_p_delChild1Recursive'
      );
      (committer as any).nativeNodeIdMap.set(
        'delGrandchild1Recursive',
        'element_for_span_delGrandchild1Recursive'
      );

      const workUnit = createWorkUnit('DELETION', child1);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(mockAdaptor.removeChild).toHaveBeenCalledWith(
        'element_for_div_delParentRecursive',
        'element_for_p_delChild1Recursive'
      );
      expect(mockAdaptor.deleteElement).toHaveBeenCalledWith(
        'element_for_p_delChild1Recursive',
        child1
      );
      expect((committer as any).nativeNodeIdMap.has('delChild1Recursive')).toBe(false);
      expect((committer as any).nativeNodeIdMap.has('delGrandchild1Recursive')).toBe(false);
      expect(mockAdaptor.deleteElement).not.toHaveBeenCalledWith(expect.anything(), grandchild1);
    });

    it('should warn if VNode has no _id for deletion', () => {
      const vnodeNoId = { type: 'div', props: {} } as VNode;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const workUnit = createWorkUnit('DELETION', vnodeNoId);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cannot commit deletion: VNode is missing _id.',
        vnodeNoId
      );
      expect(mockAdaptor.removeChild).not.toHaveBeenCalled();
      expect(mockAdaptor.deleteElement).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should log error and skip non-deletion work unit if VNode has no _id', () => {
      const vnodeNoId = { type: 'div', props: {} } as VNode;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const workUnit = createWorkUnit('PLACEMENT', vnodeNoId);
      committer.commitWork([workUnit], parentVNodeMap);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Committer: VNode is missing _id for non-deletion operation.',
        vnodeNoId,
        'PLACEMENT'
      );
      expect(mockAdaptor.createElement).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should warn for unknown effect tag', () => {
      const vnode = createVNode('idUnknown', 'div');
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const workUnit = {
        vnode,
        effectTag: 'UNKNOWN_TAG' as any,
      } as WorkUnit;

      committer.commitWork([workUnit], parentVNodeMap);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Unknown effect tag:',
        'UNKNOWN_TAG',
        'for VNode:',
        vnode
      );
      consoleWarnSpy.mockRestore();
    });
  });
});
