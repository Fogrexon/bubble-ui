import { VNode, WorkUnit } from '../types';

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
      this.createWorkUnit(workUnits, 'PLACEMENT', newVNode);
      (newVNode.props.children || []).forEach((child) => {
        this.performDiff(workUnits, parentVNodeMap, child, null, newVNode);
      });
      return;
    }

    if (newVNode === null && oldVNode !== null) {
      this.createWorkUnit(workUnits, 'DELETION', oldVNode);
      return;
    }

    if (newVNode === null || oldVNode === null) {
      return;
    }

    const areSameType = newVNode.type === oldVNode.type;

    if (!areSameType) {
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      this.createWorkUnit(workUnits, 'DELETION', oldVNode);
      this.createWorkUnit(workUnits, 'PLACEMENT', newVNode);
      (newVNode.props.children || []).forEach((child) => {
        this.performDiff(workUnits, parentVNodeMap, child, null, newVNode);
      });
    } else {
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      this.createWorkUnit(workUnits, 'UPDATE', newVNode, oldVNode);
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

    for (let i = 0; i < newChildren.length; i++) {
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
        oldStartNode = oldChildren[++oldStartIndex];
      } else if (oldEndNode === undefined) {
        oldEndNode = oldChildren[--oldEndIndex];
      } else if (this.isSameVNode(oldStartNode, newStartNode)) {
        parentVNodeMap.set(newStartNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newStartNode, oldStartNode, newParentVNode);
        oldStartNode = oldChildren[++oldStartIndex];
        newStartNode = newChildren[++newStartIndex];
      } else if (this.isSameVNode(oldEndNode, newEndNode)) {
        parentVNodeMap.set(newEndNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newEndNode, oldEndNode, newParentVNode);
        oldEndNode = oldChildren[--oldEndIndex];
        newEndNode = newChildren[--newEndIndex];
      } else if (this.isSameVNode(oldStartNode, newEndNode)) {
        parentVNodeMap.set(newEndNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newEndNode, oldStartNode, newParentVNode);

        this.createWorkUnit(
          workUnits,
          'PLACEMENT',
          newEndNode,
          oldStartNode,
          newChildren[newEndIndex + 1] || null
        );
        oldStartNode = oldChildren[++oldStartIndex];
        newEndNode = newChildren[--newEndIndex];
      } else if (this.isSameVNode(oldEndNode, newStartNode)) {
        parentVNodeMap.set(newStartNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newStartNode, oldEndNode, newParentVNode);

        this.createWorkUnit(
          workUnits,
          'PLACEMENT',
          newStartNode,
          oldEndNode,
          newChildren[newStartIndex + 1] || null
        );
        oldEndNode = oldChildren[--oldEndIndex];
        newStartNode = newChildren[++newStartIndex];
      } else {
        if (!oldKeyMap) {
          oldKeyMap = this.createKeyMap(oldChildren, oldStartIndex, oldEndIndex);
        }

        const key = newStartNode?.props?.key;
        const indexInOld = key !== undefined && newStartNode ? oldKeyMap.get(key) : undefined;

        if (indexInOld === undefined || !newStartNode) {
          if (newStartNode) {
            parentVNodeMap.set(newStartNode, newParentVNode);
            this.createWorkUnit(
              workUnits,
              'PLACEMENT',
              newStartNode,
              undefined,
              newChildren[newStartIndex + 1] || null
            );

            (newStartNode.props.children || []).forEach((child) => {
              this.performDiff(workUnits, parentVNodeMap, child, null, newStartNode);
            });
          }
        } else {
          const nodeToMove = oldChildren[indexInOld];
          if (nodeToMove && this.isSameVNode(nodeToMove, newStartNode)) {
            parentVNodeMap.set(newStartNode, newParentVNode);
            this.performDiff(workUnits, parentVNodeMap, newStartNode, nodeToMove, newParentVNode);
            oldChildren[indexInOld] = undefined as any;

            this.createWorkUnit(
              workUnits,
              'PLACEMENT',
              newStartNode,
              nodeToMove,
              newChildren[newStartIndex + 1] || null
            );
          } else if (newStartNode) {
              parentVNodeMap.set(newStartNode, newParentVNode);
              this.createWorkUnit(
                workUnits,
                'PLACEMENT',
                newStartNode,
                undefined,
                newChildren[newStartIndex + 1] || null
              );

              (newStartNode.props.children || []).forEach((child) => {
                this.performDiff(workUnits, parentVNodeMap, child, null, newStartNode);
              });
            }
        }
        if (newStartNode) {
          newStartNode = newChildren[++newStartIndex];
        } else {
          newStartIndex++;
          newStartNode = newChildren[newStartIndex];
        }
      }
    }

    if (oldStartIndex > oldEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        const nodeToAdd = newChildren[i];
        if (nodeToAdd) {
          parentVNodeMap.set(nodeToAdd, newParentVNode);
          this.createWorkUnit(
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
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        const nodeToDelete = oldChildren[i];
        if (nodeToDelete) {
          this.createWorkUnit(workUnits, 'DELETION', nodeToDelete);
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
  private isSameVNode(vnode1: VNode | null | undefined, vnode2: VNode | null | undefined): boolean {
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
  private createKeyMap(
    children: (VNode | undefined)[],
    startIndex: number,
    endIndex: number
  ): Map<string | number, number> {
    const map = new Map<string | number, number>();
    for (let i = startIndex; i <= endIndex; i++) {
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
   * @param vnode The VNode associated with the work unit.
   * @param alternate The corresponding old VNode (for UPDATE and DELETION).
   * @param nextSibling The *intended* next sibling VNode in the new children list (for PLACEMENT).
   */
  private createWorkUnit(
    workUnits: WorkUnit[],
    effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION',
    vnode: VNode,
    alternate?: VNode | null,
    nextSibling?: VNode | null
  ): void {
    const finalAlternate =
      effectTag === 'PLACEMENT' && alternate
        ? alternate
        : effectTag === 'UPDATE' || effectTag === 'DELETION'
          ? alternate
          : undefined;

    workUnits.push({
      vnode,
      effectTag,
      alternate: finalAlternate || undefined,

      nextSibling: nextSibling !== undefined ? nextSibling : vnode.sibling,
    } as WorkUnit);
  }
}
