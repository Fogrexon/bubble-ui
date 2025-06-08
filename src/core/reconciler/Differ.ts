import type { VNode, WorkUnit } from '../types';

/**
 * Interface for the differ.
 * Compares the old and new VNode trees to extract changes.
 */
export interface IDiffer {
  /**
   * Compares the old and new VNode trees and identifies changes.
   * @param newVNode The new VNode.
   * @param oldVNode The old VNode.
   * @returns An object containing the list of work units and a map of VNodes to their parents.
   */
  diff(
    newVNode: VNode | null,
    oldVNode: VNode | null
  ): { workUnits: WorkUnit[]; parentVNodeMap: WeakMap<VNode, VNode> };
}

/**
 * Implementation class for the diffing algorithm.
 * Compares old and new VNode trees to detect changes.
 */
export class Differ implements IDiffer {
  /**
   * Compares the old and new VNode trees and identifies changes.
   * @param newVNode The new VNode.
   * @param oldVNode The old VNode.
   * @returns An object containing the list of work units and a map of VNodes to their parents.
   */
  diff(
    newVNode: VNode | null,
    oldVNode: VNode | null
  ): { workUnits: WorkUnit[]; parentVNodeMap: WeakMap<VNode, VNode> } {
    const workUnits: WorkUnit[] = [];
    const parentVNodeMap = new WeakMap<VNode, VNode>();
    this.performDiff(workUnits, parentVNodeMap, newVNode, oldVNode, null);
    return { workUnits, parentVNodeMap };
  }

  /**
   * Recursive helper function to perform the diffing.
   * @param workUnits The list to add generated work units to.
   * @param parentVNodeMap The map to store parent-child relationships.
   * @param newVNode The new VNode.
   * @param oldVNode The old VNode.
   * @param parentVNode The parent VNode of the current nodes being compared.
   */
  private performDiff(
    workUnits: WorkUnit[],
    parentVNodeMap: WeakMap<VNode, VNode>,
    newVNode: VNode | null,
    oldVNode: VNode | null,
    parentVNode: VNode | null
  ): void {
    if (oldVNode === null && newVNode !== null) {
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      Differ.createWorkUnit(workUnits, 'PLACEMENT', newVNode);
      (newVNode.props.children || []).forEach((child) => {
        this.performDiff(workUnits, parentVNodeMap, child, null, newVNode);
      });
      return;
    }

    if (newVNode === null && oldVNode !== null) {
      Differ.createWorkUnit(workUnits, 'DELETION', oldVNode);
      return;
    }

    if (newVNode === null || oldVNode === null) {
      return;
    }

    const areSameType = newVNode.type === oldVNode.type;

    if (!areSameType) {
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      Differ.createWorkUnit(workUnits, 'DELETION', oldVNode);
      Differ.createWorkUnit(workUnits, 'PLACEMENT', newVNode);
      (newVNode.props.children || []).forEach((child) => {
        this.performDiff(workUnits, parentVNodeMap, child, null, newVNode);
      });
    } else {
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      Differ.createWorkUnit(workUnits, 'UPDATE', newVNode, oldVNode);
      this.reconcileChildren(workUnits, parentVNodeMap, newVNode, oldVNode);
    }
  }

  /**
   * Detects differences in child elements and generates WorkUnits.
   * Efficiently handles element moves and additions/deletions using keys.
   * Based on reconciliation algorithms like the one used in React.
   * @param workUnits The list to add generated work units to.
   * @param parentVNodeMap The map to store parent-child relationships.
   * @param newParentVNode The new parent VNode.
   * @param oldParentVNode The old parent VNode.
   */
  private reconcileChildren(
    workUnits: WorkUnit[],
    parentVNodeMap: WeakMap<VNode, VNode>,
    newParentVNode: VNode,
    oldParentVNode: VNode
  ): void {
    const oldChildren = oldParentVNode.props.children || [];
    const newChildren = newParentVNode.props.children || [];

    for (let i = 0; i < newChildren.length; i+=1) {
      const child = newChildren[i];
      if (child) {
        child.sibling = newChildren[i + 1] || null;
      }
    }

    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;
    let oldStartNode = oldChildren[oldStartIndex];
    let newStartNode = newChildren[newStartIndex];
    let oldEndNode = oldChildren[oldEndIndex];
    let newEndNode = newChildren[newEndIndex];

    let oldKeyMap: Map<string | number, number> | null = null;

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (oldStartNode === undefined) {
        oldStartIndex += 1;
        oldStartNode = oldChildren[oldStartIndex];
      } else if (oldEndNode === undefined) {
        oldEndIndex -= 1;
        oldEndNode = oldChildren[oldEndIndex];
      } else if (Differ.isSameVNode(oldStartNode, newStartNode)) {
        parentVNodeMap.set(newStartNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newStartNode, oldStartNode, newParentVNode);
        oldStartIndex += 1;
        oldStartNode = oldChildren[oldStartIndex];
        newStartIndex += 1;
        newStartNode = newChildren[newStartIndex];
      } else if (Differ.isSameVNode(oldEndNode, newEndNode)) {
        parentVNodeMap.set(newEndNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newEndNode, oldEndNode, newParentVNode);
        oldEndIndex -= 1;
        oldEndNode = oldChildren[oldEndIndex];
        newEndIndex -= 1;
        newEndNode = newChildren[newEndIndex];
      } else if (Differ.isSameVNode(oldStartNode, newEndNode)) {
        parentVNodeMap.set(newEndNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newEndNode, oldStartNode, newParentVNode);

        Differ.createWorkUnit(
          workUnits,
          'PLACEMENT',
          newEndNode,
          oldStartNode,
          newChildren[newEndIndex + 1] || null
        );
        oldStartIndex += 1;
        oldStartNode = oldChildren[oldStartIndex];
        newEndIndex -= 1;
        newEndNode = newChildren[newEndIndex];
      } else if (Differ.isSameVNode(oldEndNode, newStartNode)) {
        parentVNodeMap.set(newStartNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newStartNode, oldEndNode, newParentVNode);

        Differ.createWorkUnit(
          workUnits,
          'PLACEMENT',
          newStartNode,
          oldEndNode,
          newChildren[newStartIndex + 1] || null
        );
        oldEndIndex -= 1;
        oldEndNode = oldChildren[oldEndIndex];
        newStartIndex += 1;
        newStartNode = newChildren[newStartIndex];
      } else {
        if (!oldKeyMap) {
          oldKeyMap = Differ.createKeyMap(oldChildren, oldStartIndex, oldEndIndex);
        }

        const key = newStartNode?.props?.key;
        const indexInOld = key !== undefined && newStartNode ? oldKeyMap.get(key) : undefined;

        if (indexInOld === undefined || !newStartNode) {
          if (newStartNode) {
            parentVNodeMap.set(newStartNode, newParentVNode);
            Differ.createWorkUnit(
              workUnits,
              'PLACEMENT',
              newStartNode,
              undefined,
              newChildren[newStartIndex + 1] || null
            );

            // eslint-disable-next-line no-loop-func
            (newStartNode.props.children || []).forEach((child) => {
              this.performDiff(workUnits, parentVNodeMap, child, null, newStartNode);
            });
          }
        } else {
          const nodeToMove = oldChildren[indexInOld];
          if (nodeToMove && Differ.isSameVNode(nodeToMove, newStartNode)) {
            parentVNodeMap.set(newStartNode, newParentVNode);
            this.performDiff(workUnits, parentVNodeMap, newStartNode, nodeToMove, newParentVNode);
            oldChildren[indexInOld] = undefined as any;

            Differ.createWorkUnit(
              workUnits,
              'PLACEMENT',
              newStartNode,
              nodeToMove,
              newChildren[newStartIndex + 1] || null
            );
          } else if (newStartNode) {
              parentVNodeMap.set(newStartNode, newParentVNode);
              Differ.createWorkUnit(
                workUnits,
                'PLACEMENT',
                newStartNode,
                undefined,
                newChildren[newStartIndex + 1] || null
              );

            // eslint-disable-next-line no-loop-func
              (newStartNode.props.children || []).forEach((child) => {
                this.performDiff(workUnits, parentVNodeMap, child, null, newStartNode);
              });
            }
        }
        if (newStartNode) {
          newStartIndex += 1;
          newStartNode = newChildren[newStartIndex];
        } else {
          newStartIndex += 1;
          newStartNode = newChildren[newStartIndex];
        }
      }
    }

    if (oldStartIndex > oldEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i+=1) {
        const nodeToAdd = newChildren[i];
        if (nodeToAdd) {
          parentVNodeMap.set(nodeToAdd, newParentVNode);
          Differ.createWorkUnit(
            workUnits,
            'PLACEMENT',
            nodeToAdd,
            undefined,
            newChildren[i + 1] || null
          );

          (nodeToAdd.props.children || []).forEach((child) => {
            this.performDiff(workUnits, parentVNodeMap, child, null, nodeToAdd);
          });
        }
      }
    } else if (newStartIndex > newEndIndex) {
      for (let i = oldStartIndex; i <= oldEndIndex; i+=1) {
        const nodeToDelete = oldChildren[i];
        if (nodeToDelete) {
          Differ.createWorkUnit(workUnits, 'DELETION', nodeToDelete);
        }
      }
    }
  }

  /**
   * Checks if two VNodes are the same type and have the same key.
   * Handles null/undefined inputs gracefully.
   * @param vnode1 The first VNode.
   * @param vnode2 The second VNode.
   * @returns True if they are the same VNode type and key, false otherwise.
   */
  private static isSameVNode(vnode1: VNode | null | undefined, vnode2: VNode | null | undefined): boolean {
    if (!vnode1 || !vnode2) {
      return false;
    }
    return vnode1.type === vnode2.type && vnode1.props.key === vnode2.props.key;
  }

  /**
   * Creates a map of keys to indices for children within a specified range.
   * @param children The array of child VNodes.
   * @param startIndex The starting index of the range.
   * @param endIndex The ending index of the range.
   * @returns A Map where keys are VNode keys and values are their indices.
   */
  private static createKeyMap(
    children: (VNode | undefined)[],
    startIndex: number,
    endIndex: number
  ): Map<string | number, number> {
    const map = new Map<string | number, number>();
    for (let i = startIndex; i <= endIndex; i+=1) {
      const child = children[i];

      if (child?.props?.key !== undefined) {
        map.set(child.props.key, i);
      }
    }
    return map;
  }

  /**
   * Creates a WorkUnit and adds it to the list.
   * @param workUnits The list of work units.
   * @param effectTag The type of operation ('PLACEMENT', 'UPDATE', 'DELETION').
   * @param vNode The VNode associated with the work unit.
   * @param alternate The corresponding old VNode (for UPDATE and DELETION).
   * @param nextSibling The *intended* next sibling VNode in the new children list (for PLACEMENT).
   */
  private static createWorkUnit(
    workUnits: WorkUnit[],
    effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION',
    vNode: VNode,
    alternate?: VNode | null,
    nextSibling?: VNode | null
  ): void {
    const isPassAlternate = (effectTag === 'UPDATE' || effectTag === 'DELETION') && alternate !== undefined;
    const finalAlternate = isPassAlternate ? alternate : undefined;

    workUnits.push({
      vnode: vNode,
      effectTag,
      alternate: finalAlternate || undefined,

      nextSibling: nextSibling !== undefined ? nextSibling : vNode.sibling,
    } as WorkUnit);
  }
}
