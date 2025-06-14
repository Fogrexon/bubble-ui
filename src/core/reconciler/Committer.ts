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

  private nativeNodeMap = new WeakMap<VNode, TargetElement>();

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
    const parentVNode = parentVNodeMap.get(workUnit.vnode);
    // Root node won't have a parent in the map, but might exist if setRootElement was called
    if (!parentVNode && !this.nativeNodeMap.has(workUnit.vnode)) {
      console.error(
        'Cannot commit placement: Parent VNode not found and node is not root.',
        workUnit.vnode
      );
      return;
    }

    const parentElement = parentVNode ? this.nativeNodeMap.get(parentVNode) : null;
    if (parentVNode && !parentElement) {
      console.error('Cannot commit placement: Parent element not found for', parentVNode);
      return;
    }

    let element: TargetElement;
    if (workUnit.alternate) {
      // Move existing element
      element = this.nativeNodeMap.get(workUnit.alternate) as TargetElement;
      if (!element) {
        console.error('Cannot commit move: Element not found for alternate', workUnit.alternate);
        // Fallback: create new element
        element = this.createAndMapElement(workUnit.vnode);
        this.adaptor.updateElement(element, null, workUnit.vnode);
      } else {
        this.nativeNodeMap.set(workUnit.vnode, element); // Update mapping
        this.adaptor.updateElement(element, workUnit.alternate, workUnit.vnode); // Apply updates
      }
    } else {
      // Create new element
      element = this.createAndMapElement(workUnit.vnode);
      this.adaptor.updateElement(element, null, workUnit.vnode); // Apply initial props
    }

    // Insert into parent
    if (parentElement) {
      let beforeElement: TargetElement | null = null;
      if (workUnit.nextSibling) {
        beforeElement = this.findNextNativeSibling(workUnit.nextSibling);
      }

      if (beforeElement) {
        this.adaptor.insertChild(parentElement, element, beforeElement);
      } else {
        this.adaptor.appendChild(parentElement, element);
      }
    } else if (!parentVNode) {
      // This is the root element being placed/updated
      this.adaptor.setRootContainer(element);
      console.log('Root element placed/updated:', element);
    }
  }

  private commitUpdate(workUnit: WorkUnit): void {
    if (!workUnit.alternate) {
      console.error('Cannot commit update: Missing alternate VNode for', workUnit.vnode);
      return;
    }
    // Find element, preferring alternate VNode
    let element = this.nativeNodeMap.get(workUnit.alternate);

    if (!element) {
      // Fallback to new VNode if not found via alternate (might have been moved)
      element = this.nativeNodeMap.get(workUnit.vnode);
      if (!element) {
        console.error(
          'Cannot commit update: Element not found for alternate or new VNode',
          workUnit.alternate,
          workUnit.vnode
        );
        return;
      }
      console.warn(
        'Commit update found element via new VNode, not alternate. Alternate might be stale.',
        workUnit
      );
    } else {
      // Update mapping to the new VNode
      this.nativeNodeMap.set(workUnit.vnode, element);
    }

    // Perform the update
    this.adaptor.updateElement(element, workUnit.alternate, workUnit.vnode);
  }

  private commitDeletion(workUnit: WorkUnit, parentVNodeMap: WeakMap<VNode, VNode>): void {
    const parentVNode = parentVNodeMap.get(workUnit.vnode);
    const element = this.nativeNodeMap.get(workUnit.vnode);

    if (!element) {
      console.warn('Cannot commit deletion: Element not found for', workUnit.vnode);
      // Still try to recursively delete children mappings
      this.recursivelyDelete(workUnit.vnode, true);
      return;
    }

    if (parentVNode) {
      const parentElement = this.nativeNodeMap.get(parentVNode);
      if (parentElement) {
        this.adaptor.removeChild(parentElement, element);
        this.deleteElement(workUnit.vnode, element);
      } else {
        console.warn('Cannot commit deletion: Parent element not found in map for', parentVNode);
      }
    } else if (this.adaptor.getRootContainer() === element) {
      // If the element is the root container, clear it
      this.adaptor.setRootContainer(null);
      this.deleteElement(workUnit.vnode, element);
      console.log('Root element deleted:', workUnit.vnode);
    } else {
      // If no parent VNode and not root, log a warning
      // This might happen if the VNode was orphaned or not properly tracked
      console.warn(
        'Cannot commit deletion: No parent VNode found and not root element.',
        workUnit.vnode
      );
    }

    // Recursively remove mappings and potentially destroy elements
    this.recursivelyDelete(workUnit.vnode);
  }

  // --- Helper Methods ---

  /**
   * Creates a native element using the adaptor, stores the mapping, and sets initial text content if applicable.
   * @param vnode The VNode to create an element for.
   * @returns The created native element.
   */
  private createAndMapElement(vnode: VNode): TargetElement {
    const element = this.adaptor.createElement(vnode);
    this.nativeNodeMap.set(vnode, element);

    return element;
  }

  /**
   * Recursively removes VNode-to-element mappings for a deleted VNode subtree.
   * Optionally, the adaptor could implement element destruction here.
   * @param vnode The root of the subtree to delete mappings for.
   * @param skipCurrentNode If true, skips removing the mapping for the initial vnode.
   */
  private recursivelyDelete(vnode: VNode, skipCurrentNode = false): void {
    if (!skipCurrentNode) {
      const element = this.nativeNodeMap.get(vnode);
      if (element) {
        this.deleteElement(vnode, element);
      }
    }

    // Recursively delete children mappings
    if (vnode.props && vnode.props.children) {
      vnode.props.children.forEach((child) => {
        if (child) {
          this.recursivelyDelete(child);
        }
      });
    }
    // TODO: Handle component children if/when components are implemented
    // if (vnode._component && vnode._component.renderedVNode) {
    //     this.recursivelyDelete(vnode._component.renderedVNode);
    // }
  }

  /**
   * Finds the first native element corresponding to a sibling VNode
   * starting from the given `startSiblingVNode`.
   * Requires VNodes to have a way to traverse siblings (e.g., a `sibling` property).
   * @param startSiblingVNode The VNode to start searching from.
   * @returns The corresponding native element, or null if not found.
   */
  private findNextNativeSibling(startSiblingVNode: VNode | null): TargetElement | null {
    let currentVNode: VNode | null = startSiblingVNode;
    while (currentVNode) {
      const nativeElement = this.nativeNodeMap.get(currentVNode);
      if (nativeElement) {
        return nativeElement; // Found
      }
      // Requires VNode.sibling property or alternative strategy
      currentVNode = (currentVNode as any).sibling || null; // Placeholder
      if (!currentVNode) {
        console.warn(
          'findNextNativeSibling requires VNode.sibling property or alternative strategy.'
        );
      }
    }
    return null; // Not found
  }

  /**
   * Deletes a specific element and its mapping from the nativeNodeMap.
   * This is used for cleanup when a VNode is removed.
   * @param vnode The VNode corresponding to the element being deleted.
   * @param element The native element to delete.
   */
  private deleteElement(vnode: VNode, element: TargetElement): void {
    this.adaptor.deleteElement(element, vnode);
    this.nativeNodeMap.delete(vnode);
  }
}
