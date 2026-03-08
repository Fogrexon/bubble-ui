import { v4 as uuidv4 } from 'uuid';
import type { VNode, WorkUnit } from '../types';

export interface IDiffer {
  diff(
    newVNode: VNode | null,
    oldVNode: VNode | null
  ): { workUnits: WorkUnit[]; parentVNodeMap: WeakMap<VNode, VNode> };
}

export class Differ implements IDiffer {
  diff(
    newVNode: VNode | null,
    oldVNode: VNode | null
  ): { workUnits: WorkUnit[]; parentVNodeMap: WeakMap<VNode, VNode> } {
    const workUnits: WorkUnit[] = [];
    const parentVNodeMap = new WeakMap<VNode, VNode>();
    this.performDiff(workUnits, parentVNodeMap, newVNode, oldVNode, null);
    return { workUnits, parentVNodeMap };
  }

  private performDiff(
    workUnits: WorkUnit[],
    parentVNodeMap: WeakMap<VNode, VNode>,
    newVNode: VNode | null,
    oldVNode: VNode | null,
    parentVNode: VNode | null
  ): void {
    if (oldVNode === null && newVNode !== null) {
      if (!newVNode._id) {
        newVNode._id = uuidv4();
      }
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

    const isSameVNode = Differ.isSameVNode(newVNode, oldVNode);

    if (!isSameVNode) {
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      if (!newVNode._id) {
        newVNode._id = uuidv4();
      }
      Differ.createWorkUnit(workUnits, 'DELETION', oldVNode);
      Differ.createWorkUnit(workUnits, 'PLACEMENT', newVNode);
      (newVNode.props.children || []).forEach((child) => {
        this.performDiff(workUnits, parentVNodeMap, child, null, newVNode);
      });
    } else {
      if (oldVNode._id) {
        newVNode._id = oldVNode._id;
        newVNode._instance = oldVNode._instance;
        newVNode._reconciler = oldVNode._reconciler;
      } else if (!newVNode._id) {
        newVNode._id = uuidv4();
      }

      if (!Differ.isSameVNodeProps(newVNode, oldVNode)) {
        if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
        Differ.createWorkUnit(workUnits, 'UPDATE', newVNode, oldVNode);
      }
      this.reconcileChildren(workUnits, parentVNodeMap, newVNode, oldVNode);
    }
  }

  private reconcileChildren(
    workUnits: WorkUnit[],
    parentVNodeMap: WeakMap<VNode, VNode>,
    newParentVNode: VNode,
    oldParentVNode: VNode
  ): void {
    const oldChildren = oldParentVNode.props.children || [];
    const newChildren = newParentVNode.props.children || [];

    for (let i = 0; i < newChildren.length; i += 1) {
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
        if (oldStartNode._id) {
          newStartNode._id = oldStartNode._id;
          newStartNode._instance = oldStartNode._instance;
          newStartNode._reconciler = oldStartNode._reconciler;
        }
        parentVNodeMap.set(newStartNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newStartNode, oldStartNode, newParentVNode);
        oldStartIndex += 1;
        oldStartNode = oldChildren[oldStartIndex];
        newStartIndex += 1;
        newStartNode = newChildren[newStartIndex];
      } else if (Differ.isSameVNode(oldEndNode, newEndNode)) {
        if (oldEndNode._id) {
          newEndNode._id = oldEndNode._id;
          newEndNode._instance = oldEndNode._instance;
          newEndNode._reconciler = oldEndNode._reconciler;
        }
        parentVNodeMap.set(newEndNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newEndNode, oldEndNode, newParentVNode);
        oldEndIndex -= 1;
        oldEndNode = oldChildren[oldEndIndex];
        newEndIndex -= 1;
        newEndNode = newChildren[newEndIndex];
      } else {
        if (!oldKeyMap) {
          oldKeyMap = Differ.createKeyMap(oldChildren, oldStartIndex, oldEndIndex);
        }

        const key = newStartNode?.props?.key;
        const indexInOld = key !== undefined && newStartNode ? oldKeyMap.get(key) : undefined;

        if (indexInOld === undefined || !newStartNode) {
          if (newStartNode) {
            if (!newStartNode._id) {
              newStartNode._id = uuidv4();
            }
            parentVNodeMap.set(newStartNode, newParentVNode);
            Differ.createWorkUnit(
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
          if (nodeToMove && Differ.isSameVNode(nodeToMove, newStartNode)) {
            if (nodeToMove._id) {
              newStartNode._id = nodeToMove._id;
              newStartNode._instance = nodeToMove._instance;
              newStartNode._reconciler = nodeToMove._reconciler;
            }
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
            if (!newStartNode._id) {
              newStartNode._id = uuidv4();
            }
            parentVNodeMap.set(newStartNode, newParentVNode);
            Differ.createWorkUnit(
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
        newStartIndex += 1;
        newStartNode = newChildren[newStartIndex];
      }
    }

    if (oldStartIndex > oldEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i += 1) {
        const nodeToAdd = newChildren[i];
        if (nodeToAdd) {
          if (!nodeToAdd._id) {
            nodeToAdd._id = uuidv4();
          }
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
      for (let i = oldStartIndex; i <= oldEndIndex; i += 1) {
        const nodeToDelete = oldChildren[i];
        if (nodeToDelete) {
          parentVNodeMap.set(nodeToDelete, newParentVNode);
          Differ.createWorkUnit(workUnits, 'DELETION', nodeToDelete);
        }
      }
    }
  }

  private static isSameVNode(
    vnode1: VNode | null | undefined,
    vnode2: VNode | null | undefined
  ): boolean {
    if (!vnode1 || !vnode2) return false;
    if (vnode1.type !== vnode2.type) return false;
    if (vnode1.type === 'PRIMITIVE') return vnode1._text === vnode2._text;
    return vnode1._key === vnode2._key;
  }

  private static isSameVNodeProps(vnode1: VNode, vnode2: VNode): boolean {
    if (vnode1.props.key !== vnode2.props.key) return false;
    const keys1 = Object.keys(vnode1.props);
    const keys2 = Object.keys(vnode2.props);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
      if (key !== 'children' && vnode1.props[key] !== vnode2.props[key]) return false;
    }
    return true;
  }

  private static createKeyMap(
    children: (VNode | undefined)[],
    startIndex: number,
    endIndex: number
  ): Map<string | number, number> {
    const map = new Map<string | number, number>();
    for (let i = startIndex; i <= endIndex; i += 1) {
      const child = children[i];
      if (child?.props?.key !== undefined) {
        map.set(child.props.key, i);
      }
    }
    return map;
  }

  private static createWorkUnit(
    workUnits: WorkUnit[],
    effectTag: 'PLACEMENT' | 'UPDATE' | 'DELETION',
    vNode: VNode,
    alternate?: VNode | null,
    nextSibling?: VNode | null
  ): void {
    workUnits.push({
      vnode: vNode,
      effectTag,
      alternate: alternate || undefined,
      nextSibling: nextSibling !== undefined ? nextSibling : vNode.sibling,
    } as WorkUnit);
  }
}
