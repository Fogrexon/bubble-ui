import { v4 as uuidv4 } from 'uuid'; // uuidライブラリを使用
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
      // PLACEMENT (新しいノード)
      if (!newVNode._id) {
        // IDがまだなければ発行
        // eslint-disable-next-line no-param-reassign
        newVNode._id = uuidv4();
      }
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      Differ.createWorkUnit(workUnits, 'PLACEMENT', newVNode);
      (newVNode.props.children || []).forEach((child) => {
        // 子要素の performDiff 呼び出し時、その子 newVNode にも同様にID発行/引き継ぎが必要
        this.performDiff(workUnits, parentVNodeMap, child, null, newVNode);
      });
      return;
    }

    if (newVNode === null && oldVNode !== null) {
      // DELETION
      Differ.createWorkUnit(workUnits, 'DELETION', oldVNode);
      return;
    }

    if (newVNode === null || oldVNode === null) {
      return;
    }

    const isSameVNode = Differ.isSameVNode(newVNode, oldVNode);

    if (!isSameVNode) {
      // タイプまたはキーが異なる -> 古いものを削除し、新しいものを配置
      if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
      // newVNode は全く新しいノードなので、IDがなければ発行
      if (!newVNode._id) {
        // eslint-disable-next-line no-param-reassign
        newVNode._id = uuidv4();
      }
      Differ.createWorkUnit(workUnits, 'DELETION', oldVNode); // oldVNode は ID を持っているはず
      Differ.createWorkUnit(workUnits, 'PLACEMENT', newVNode);
      (newVNode.props.children || []).forEach((child) => {
        this.performDiff(workUnits, parentVNodeMap, child, null, newVNode);
      });
    } else {
      // isSameVNode が true (タイプとキーが一致)
      if (oldVNode._id) {
        // eslint-disable-next-line no-param-reassign
        newVNode._id = oldVNode._id; // 正常なID引き継ぎ
      } else {
        // oldVNode に _id がないのは予期しない状況
        console.error(
          'Differ: oldVNode is missing _id during an update comparison. This indicates an issue in ID propagation or initial assignment.',
          oldVNode
        );
        // newVNode にも _id がなければ、新しいIDを発行して処理を継続する
        // これにより、この VNode が後続の処理 (Committerなど) でIDを持つことが保証される
        if (!newVNode._id) {
          // eslint-disable-next-line no-param-reassign
          newVNode._id = uuidv4();
          console.warn(
            'Differ: Assigned new _id to newVNode as a fallback because oldVNode was missing _id.',
            newVNode
          );
        }
        // newVNode._id が既に存在する場合 (例: oldVNode._idなし、newVNode._idあり)、newVNode._id を維持
      }
      // この時点で newVNode は確実に _id を持つ (上記ロジックにより)

      if (!Differ.isSameVNodeProps(newVNode, oldVNode)) {
        if (parentVNode) parentVNodeMap.set(newVNode, parentVNode);
        Differ.createWorkUnit(workUnits, 'UPDATE', newVNode, oldVNode);
      }
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

    for (let i = 0; i < newChildren.length; i += 1) {
      const child = newChildren[i];
      if (child) {
        // eslint-disable-next-line no-param-reassign
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
        // eslint-disable-next-line no-param-reassign
        if (oldStartNode._id) newStartNode._id = oldStartNode._id; // ID引き継ぎ
        parentVNodeMap.set(newStartNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newStartNode, oldStartNode, newParentVNode);
        oldStartIndex += 1;
        oldStartNode = oldChildren[oldStartIndex];
        newStartIndex += 1;
        newStartNode = newChildren[newStartIndex];
      } else if (Differ.isSameVNode(oldEndNode, newEndNode)) {
        // eslint-disable-next-line no-param-reassign
        if (oldEndNode._id) newEndNode._id = oldEndNode._id; // ID引き継ぎ
        parentVNodeMap.set(newEndNode, newParentVNode);
        this.performDiff(workUnits, parentVNodeMap, newEndNode, oldEndNode, newParentVNode);
        oldEndIndex -= 1;
        oldEndNode = oldChildren[oldEndIndex];
        newEndIndex -= 1;
        newEndNode = newChildren[newEndIndex];
      } else if (Differ.isSameVNode(oldStartNode, newEndNode)) {
        // eslint-disable-next-line no-param-reassign
        if (oldStartNode._id) newEndNode._id = oldStartNode._id; // ID引き継ぎ
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
        // eslint-disable-next-line no-param-reassign
        if (oldEndNode._id) newStartNode._id = oldEndNode._id; // ID引き継ぎ
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
          // 新しいノードとして配置 (キーで見つからなかったか、キーがない)
          if (newStartNode) {
            if (!newStartNode._id) {
              // IDがなければ発行
              // eslint-disable-next-line no-param-reassign
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

            // eslint-disable-next-line no-loop-func
            (newStartNode.props.children || []).forEach((child) => {
              this.performDiff(workUnits, parentVNodeMap, child, null, newStartNode);
            });
          }
        } else {
          const nodeToMove = oldChildren[indexInOld];
          if (nodeToMove && Differ.isSameVNode(nodeToMove, newStartNode)) {
            // eslint-disable-next-line no-param-reassign
            if (nodeToMove._id) newStartNode._id = nodeToMove._id; // ID引き継ぎ
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
            // キーで見つかったが、isSameVNode で false (タイプが異なるなど) -> 古いものを削除し新しいものを配置
            if (!newStartNode._id) {
              // IDがなければ発行
              // eslint-disable-next-line no-param-reassign
              newStartNode._id = uuidv4();
            }
            // このケースでは、indexInOld の nodeToMove を DELETION し、newStartNode を PLACEMENT するのがより正確だが、
            // 現在のロジックは newStartNode の PLACEMENT のみ。
            // oldChildren[indexInOld] = undefined as any; // 古いものはマーク済み
            // Differ.createWorkUnit(workUnits, 'DELETION', nodeToMove); // 本来はこれも必要
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
      // 古い子リストが先に尽きた -> 残りの新しい子はすべて PLACEMENT
      for (let i = newStartIndex; i <= newEndIndex; i += 1) {
        const nodeToAdd = newChildren[i];
        if (nodeToAdd) {
          if (!nodeToAdd._id) {
            // IDがなければ発行
            // eslint-disable-next-line no-param-reassign
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
      // 新しい子リストが先に尽きた -> 残りの古い子はすべて DELETION
      for (let i = oldStartIndex; i <= oldEndIndex; i += 1) {
        const nodeToDelete = oldChildren[i];
        if (nodeToDelete) {
          // nodeToDelete は既に ID を持っているはず
          parentVNodeMap.set(nodeToDelete, newParentVNode);
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
  private static isSameVNode(
    vnode1: VNode | null | undefined,
    vnode2: VNode | null | undefined
  ): boolean {
    if (!vnode1 || !vnode2) {
      return false;
    }

    if (vnode1.type !== vnode2.type) {
      return false;
    }

    if (vnode1.type === 'PRIMITIVE') {
      return vnode1._text === vnode2._text;
    }
    return vnode1._key === vnode2._key;
  }

  /**
   * Checks if two VNodes have the same props.
   * Handles null/undefined inputs gracefully.
   * @param vnode1 The first VNode.
   * @param vnode2 The second VNode.
   * @returns True if they have the same props, false otherwise.
   */
  private static isSameVNodeProps(vnode1: VNode, vnode2: VNode): boolean {
    if (vnode1.props.key !== vnode2.props.key) {
      return false;
    }

    // Check if both VNodes have the same keys and values in their props
    const keys1 = Object.keys(vnode1.props);
    const keys2 = Object.keys(vnode2.props);
    const diffKeys = keys1
      .filter((key) => !keys2.includes(key))
      .concat(keys2.filter((key) => !keys1.includes(key)));
    if (diffKeys.length > 0) {
      return false;
    }

    // Check if all keys have the same values
    for (let i = 0; i < keys1.length; i += 1) {
      const key = keys1[i];
      if (key !== 'children') {
        if (vnode1.props[key] !== vnode2.props[key]) {
          return false;
        }
      }
    }

    // Compare other properties if needed
    // For now, we only compare the key
    return true;
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
    for (let i = startIndex; i <= endIndex; i += 1) {
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
    alternate?: VNode | null, // PLACEMENT(移動)時は移動元、UPDATE/DELETION時は更新前/削除対象のノード
    nextSibling?: VNode | null
  ): void {
    // alternate が提供されていれば、それを WorkUnit に含める
    // (UPDATE/DELETION では必須、PLACEMENT(移動)では移動元を示す)
    const finalAlternate = alternate || undefined;

    workUnits.push({
      vnode: vNode, // PLACEMENT なら新しいノード、UPDATE なら更新後のノード、DELETION なら削除されるノード
      effectTag,
      alternate: finalAlternate,
      nextSibling: nextSibling !== undefined ? nextSibling : vNode.sibling,
    } as WorkUnit);
  }
}
