import { Injectable } from '@angular/core';
import { TREE_DATA } from '@constants';
import { BehaviorSubject } from 'rxjs';
import { TreeItemNode } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TreeNodeService {
  dataChange$ = new BehaviorSubject<TreeItemNode[]>([]);

  get data(): TreeItemNode[] {
    return this.dataChange$.value;
  }

  constructor() {
    this.initialize();
  }

  createData(data: any[]) {
    return data.map(it => {
      if (it.children && it.children.length > 0) {
        this.createData(it.children);
      }

      return new TreeItemNode(it)
    })
  }

  initialize() {
    const data = this.createData(TREE_DATA);

    this.dataChange$.next(data);
  }

  insertItem(parent: TreeItemNode, node: TreeItemNode, isFolder = false): TreeItemNode {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = new TreeItemNode({ ...node, expandable: isFolder });
    parent.children.push(newItem);
    this.dataChange$.next(this.data);

    return newItem;
  }

  getParent(currentRoot: TreeItemNode, node: TreeItemNode): TreeItemNode | null {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  deleteItem(node: TreeItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange$.next(this.data);
  }

  copyPasteItem(from: TreeItemNode, to: TreeItemNode): TreeItemNode {
    const newItem = this.insertItem(to, from, from.expandable);
    if (from.children) {
      from.children.forEach((child) => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  deleteNode(nodes: TreeItemNode[], nodeToDelete: TreeItemNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }
}
