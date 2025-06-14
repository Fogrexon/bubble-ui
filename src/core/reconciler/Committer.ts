import type { VNode, WorkUnit } from '../types';
import type { IRendererAdaptor } from '../IRendererAdaptor.ts';

/**
 * Interface for the committer.
 * Applies the changes (WorkUnits) to the actual rendering target.
 */
export interface ICommitter {
  /**
   * Applies a list of work units to the rendering target.
   * @param workUnits The list of changes to apply.
   * @param parentVNodeMap A map to find the parent VNode for a given VNode.
   */
  commitWork(workUnits: WorkUnit[], parentVNodeMap: WeakMap<VNode, VNode>): void;
}

/**
 * Applies changes identified by the Differ to the rendering target using a RendererAdaptor.
 */
export class Committer<TargetElement = unknown> implements ICommitter {
  private adaptor: IRendererAdaptor<TargetElement>;

  private nativeNodeIdMap = new Map<string, TargetElement>(); // VNode._id をキーとするMap

  constructor(adaptor: IRendererAdaptor<TargetElement>) {
    this.adaptor = adaptor;
  }

  commitWork(workUnits: WorkUnit[], parentVNodeMap: WeakMap<VNode, VNode>): void {
    type GroupedWorkUnits = {
      deletions: WorkUnit[];
      updates: WorkUnit[];
      placements: WorkUnit[];
    };
    const groupedWorkUnits = workUnits.reduce<GroupedWorkUnits>(
      (acc, unit) => {
        if (!unit.vnode._id && unit.effectTag !== 'DELETION') {
          // DELETION 以外の操作で ID がない場合はエラー (DifferがIDを付与する責務を持つため)
          console.error(
            'Committer: VNode is missing _id for non-deletion operation.',
            unit.vnode,
            unit.effectTag
          );
          // この WorkUnit はスキップするか、エラー処理を行う
          return acc;
        }
        if (unit.effectTag === 'DELETION') {
          acc.deletions.push(unit);
        } else if (unit.effectTag === 'UPDATE') {
          acc.updates.push(unit);
        } else if (unit.effectTag === 'PLACEMENT') {
          acc.placements.push(unit);
        } else {
          console.warn('Unknown effect tag:', unit.effectTag, 'for VNode:', unit.vnode);
        }
        return acc;
      },
      { deletions: [], updates: [], placements: [] }
    );

    // Process in order: Deletions -> Updates -> Placements
    groupedWorkUnits.deletions.forEach((unit) => this.commitDeletion(unit, parentVNodeMap));
    groupedWorkUnits.updates.forEach((unit) => this.commitUpdate(unit));
    groupedWorkUnits.placements.forEach((unit) => this.commitPlacement(unit, parentVNodeMap));
  }

  // --- Private Commit Methods ---

  private commitPlacement(workUnit: WorkUnit, parentVNodeMap: WeakMap<VNode, VNode>): void {
    const vnodeId = workUnit.vnode._id!; // DifferがIDを付与済みと仮定
    const parentVNode = parentVNodeMap.get(workUnit.vnode);

    // New root node won't have a parent in the map
    if (!parentVNode && !this.nativeNodeIdMap.has(vnodeId)) {
      const element = this.createAndMapElement(workUnit.vnode);
      this.adaptor.setRootContainer(element);
      // createAndMapElement で nativeNodeIdMap に登録済み
      return;
    }

    // 親VNodeから親TargetElementを取得 (親VNodeのIDもDifferが付与済みのはず)
    const parentElement = parentVNode?._id ? this.nativeNodeIdMap.get(parentVNode._id) : null;

    if (parentVNode && !parentElement) {
      console.error(
        'Cannot commit placement: Parent element not found for ID',
        parentVNode._id,
        parentVNode
      );
      return;
    }

    let element: TargetElement;
    const isMove = workUnit.alternate?._id && this.nativeNodeIdMap.has(workUnit.alternate._id);

    if (isMove) {
      // Move existing element
      element = this.nativeNodeIdMap.get(workUnit.alternate!._id as string) as TargetElement;
      // IDが引き継がれているので、古いIDのマッピング削除は不要。新しいIDで最新のvnodeを指すようにする。
      this.nativeNodeIdMap.set(vnodeId, element); // vnodeId は workUnit.vnode._id!
      this.adaptor.updateElement(element, workUnit.alternate || null, workUnit.vnode); // Propsの更新
      // 物理的な移動は後段の Insert into parent で行う
    } else {
      // Create new element
      element = this.createAndMapElement(workUnit.vnode); // この中で vnodeId でマップされる
      this.adaptor.updateElement(element, null, workUnit.vnode); // Apply initial props
    }

    // Insert into parent / Move within parent
    if (parentElement) {
      let beforeElement: TargetElement | null = null;
      const nextSiblingId = workUnit.nextSibling?._id;
      if (nextSiblingId !== undefined) {
        beforeElement = this.findNextNativeSiblingById(nextSiblingId);
      }

      // isMove であってもなくても、アダプタの insertChild/appendChild が移動を処理すると仮定
      // TextAdaptor側で、要素追加前に既存の場所から削除する処理が入ったため、
      // Committerは単純に新しい場所に挿入/追加するだけで良い。
      if (beforeElement) {
        this.adaptor.insertChild(parentElement, element, beforeElement);
      } else {
        this.adaptor.appendChild(parentElement, element);
      }
    } else if (!parentVNode) {
      // This is the root element being placed/updated
      this.adaptor.setRootContainer(element);
    }
  }

  private commitUpdate(workUnit: WorkUnit): void {
    if (!workUnit.alternate?._id) {
      console.error('Cannot commit update: Missing _id on alternate VNode for', workUnit.vnode);
      return;
    }
    const vnodeId = workUnit.vnode._id!; // DifferがIDを引き継ぎ済みと仮定
    const alternateId = workUnit.alternate._id;

    let element = this.nativeNodeIdMap.get(alternateId);

    if (!element) {
      console.error(
        'Cannot commit update: Element not found for alternate ID',
        alternateId,
        workUnit.alternate
      );
      // フォールバックとして新しいvnodeのIDで試す (DifferのID引き継ぎが確実なら不要なはず)
      element = this.nativeNodeIdMap.get(vnodeId);
      if (!element) {
        console.error(
          'Cannot commit update: Element not found for new VNode ID either',
          vnodeId,
          workUnit.vnode
        );
        return;
      }
    }

    // IDが引き継がれているので、alternateId と vnodeId は同じはず。
    // もし異なる場合は、古いIDのマッピングを削除し、新しいIDで登録する。
    if (alternateId !== vnodeId) {
      this.nativeNodeIdMap.delete(alternateId);
      this.nativeNodeIdMap.set(vnodeId, element);
    }

    // Perform the update
    this.adaptor.updateElement(element, workUnit.alternate, workUnit.vnode);
  }

  private commitDeletion(workUnit: WorkUnit, parentVNodeMap: WeakMap<VNode, VNode>): void {
    const vnodeId = workUnit.vnode._id;
    if (!vnodeId) {
      console.warn('Cannot commit deletion: VNode is missing _id.', workUnit.vnode);
      // IDがない場合、マップからの削除はできないが、子の再帰的削除は試みる
      this.recursivelyDelete(workUnit.vnode, true);
      return;
    }

    const element = this.nativeNodeIdMap.get(vnodeId);

    if (!element) {
      console.warn('Cannot commit deletion: Element not found for ID', vnodeId, workUnit.vnode);
      this.recursivelyDelete(workUnit.vnode, true); // マップになくても子の処理は行う
      return;
    }

    const parentVNode = parentVNodeMap.get(workUnit.vnode);
    if (parentVNode && parentVNode._id) {
      const parentElement = this.nativeNodeIdMap.get(parentVNode._id);
      if (parentElement) {
        this.adaptor.removeChild(parentElement, element);
      } else {
        console.warn(
          'Cannot commit deletion: Parent element not found in map for ID',
          parentVNode._id
        );
      }
    } else if (this.adaptor.getRootContainer() === element) {
      this.adaptor.setRootContainer(null);
    } else {
      console.warn(
        'Cannot commit deletion: No parent VNode with ID found and not root element. ID:',
        vnodeId,
        workUnit.vnode
      );
    }

    this.deleteElement(workUnit.vnode, element); // マップからの削除とアダプタのdeleteElement呼び出し
    this.recursivelyDelete(workUnit.vnode); // 子要素のマッピングも再帰的に削除
  }

  // --- Helper Methods ---

  private createAndMapElement(vnode: VNode): TargetElement {
    // vnode._id は Differ によって設定されているか、この関数の呼び出し元 (commitPlacement) で設定される前提
    if (!vnode._id) {
      // このパスは通常通らないはず (DifferがIDを付与するため)
      console.error('createAndMapElement: VNode is missing _id!', vnode);
      // フォールバックとしてIDを生成することもできるが、設計違反の可能性
      // vnode._id = randomUUID();
    }
    const element = this.adaptor.createElement(vnode);
    this.nativeNodeIdMap.set(vnode._id!, element);
    return element;
  }

  private recursivelyDelete(vnode: VNode, skipCurrentNode = false): void {
    if (!skipCurrentNode && vnode._id) {
      const element = this.nativeNodeIdMap.get(vnode._id);
      if (element) {
        // adaptor.deleteElement は deleteElement メソッド内で行うのでここでは不要
        this.nativeNodeIdMap.delete(vnode._id);
      }
    }

    if (vnode.props && vnode.props.children) {
      vnode.props.children.forEach((child) => {
        if (child) {
          this.recursivelyDelete(child); // 子のIDがあればマップから削除される
        }
      });
    }
  }

  private findNextNativeSiblingById(siblingId: string | undefined): TargetElement | null {
    if (!siblingId) return null;
    return this.nativeNodeIdMap.get(siblingId) || null;
  }

  // findNextNativeSibling はIDベースに変更したので不要になるか、
  // VNode.sibling を使った探索が必要な場合は残す。今回はIDベースで統一。
  /*
  private findNextNativeSibling(startSiblingVNode: VNode | null): TargetElement | null {
    let currentVNode: VNode | null = startSiblingVNode;
    while (currentVNode) {
      if (currentVNode._id) {
        const nativeElement = this.nativeNodeIdMap.get(currentVNode._id);
        if (nativeElement) {
          return nativeElement; // Found
        }
      }
      currentVNode = (currentVNode as any).sibling || null;
      if (!currentVNode) {
        // console.warn(
        //   'findNextNativeSibling requires VNode.sibling property or alternative strategy.'
        // );
      }
    }
    return null; // Not found
  }
  */

  private deleteElement(vnode: VNode, element: TargetElement): void {
    this.adaptor.deleteElement(element, vnode);
    if (vnode._id) {
      this.nativeNodeIdMap.delete(vnode._id);
    }
  }
}
