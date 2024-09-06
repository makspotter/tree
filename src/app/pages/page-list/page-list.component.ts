import { FlatTreeControl } from '@angular/cdk/tree';
import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatTree, MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeToggle,
} from '@angular/material/tree';
import { MATERIAL_ICONS_LIST } from '@constants/icons-list.constant';
import { DestroyService, TreeNodeService } from '@services';
import { takeUntil } from 'rxjs';
import * as uuid from 'uuid';
import { TreeItemNode } from '../../shared/models';

const COUNT_ITEMS_FOR_ADD = 50;
const NODE_LEFT_MARGIN = 24;
const NODE_NAME_MAX_LENGTH = 40;

@Component({
  selector: 'app-page-list',
  standalone: true,
  imports: [
    MatTreeNode,
    NgClass,
    MatTree,
    MatTreeNodeToggle,
    MatTreeNodePadding,
    MatTreeNodeDef,
    MatIconButton,
    MatIcon,
    ReactiveFormsModule,
    NgIf,
    MatButton,
  ],
  templateUrl: './page-list.component.html',
  styleUrl: './page-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
  host: {
    class: 'g-flex-column',
  },
})
export class PageListComponent implements OnInit {
  flatNodeMap = new Map<TreeItemNode, TreeItemNode>();
  nestedNodeMap = new Map<TreeItemNode, TreeItemNode>();
  flatTreeControl: FlatTreeControl<TreeItemNode>;
  treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemNode>;
  dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemNode>;
  selectedNode?: TreeItemNode;
  nodeNameControl: FormControl<string | null> = new FormControl('');

  dragNode?: TreeItemNode;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode?: TreeItemNode;
  dragNodeExpandOverTime: number;
  selectedIconName?: string;

  COUNT_ITEMS_FOR_ADD = COUNT_ITEMS_FOR_ADD;
  MATERIAL_ICONS_LIST = MATERIAL_ICONS_LIST;
  NODE_LEFT_MARGIN = NODE_LEFT_MARGIN;
  NODE_NAME_MAX_LENGTH = NODE_NAME_MAX_LENGTH;

  hasChild = (_: number, _nodeData: TreeItemNode) => _nodeData.expandable;

  constructor(
    private treeNodeService: TreeNodeService,
    private destroy$: DestroyService,
  ) {
    const getLevel = (node: TreeItemNode) => node.level;
    const isExpandable = (node: TreeItemNode) => node.expandable;
    const getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;

    const transformer = (node: TreeItemNode, level: number) => {
      const existingNode = this.nestedNodeMap.get(node);
      const flatNode = existingNode && existingNode.id === node.id
        ? existingNode
        : new TreeItemNode({
          ...node,
          level,
          expandable: node.expandable === true ? node.expandable : node.children && node.children.length > 0,
        });
      this.flatNodeMap.set(flatNode, node);
      this.nestedNodeMap.set(node, flatNode);
      return flatNode;
    };

    this.treeFlattener = new MatTreeFlattener(
      transformer,
      getLevel,
      isExpandable,
      getChildren,
    );

    this.flatTreeControl = new FlatTreeControl<TreeItemNode>(
      getLevel,
      isExpandable,
    );

    this.dataSource = new MatTreeFlatDataSource(
      this.flatTreeControl,
      this.treeFlattener,
    );

    treeNodeService.dataChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.dataSource.data = data;
      });
  }

  ngOnInit() {
    this.nodeNameControl.disable();
  }

  handleDragStart(node: TreeItemNode) {
    this.dragNode = node;
    this.flatTreeControl.collapse(node);
  }

  handleDragOver(event: DragEvent, node: TreeItemNode) {
    event.preventDefault();

    if (this.dragNodeExpandOverNode && node === this.dragNodeExpandOverNode) {
      if (Date.now() - this.dragNodeExpandOverTime > this.dragNodeExpandOverWaitTimeMs
        && !this.flatTreeControl.isExpanded(node)) {
        this.flatTreeControl.expand(node);
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }
  }

  handleDrop(event: DragEvent, node: TreeItemNode) {
    if (!this.dragNode || !node.expandable) {
      return;
    }

    if (node !== this.dragNode) {
      const newItem = this.treeNodeService.copyPasteItem(
        this.flatNodeMap.get(this.dragNode)!,
        this.flatNodeMap.get(node)!,
      );

      if (!event.shiftKey) {
        this.treeNodeService.deleteItem(this.flatNodeMap.get(this.dragNode)!);
      }

      this.flatTreeControl.expandDescendants(this.nestedNodeMap.get(newItem)!);

      this.expandCollapseParent(node);
    }

    this.handleDragEnd(event);
  }

  handleDragEnd(event: DragEvent) {
    this.dragNode = undefined;
    this.dragNodeExpandOverNode = undefined;
    this.dragNodeExpandOverTime = 0;

    event.preventDefault();
  }

  deleteItem(node: TreeItemNode) {
    this.treeNodeService.deleteItem(this.flatNodeMap.get(node)!);
  }

  onSelectNode(node: TreeItemNode) {
    this.selectedNode = this.selectedNode === node ? undefined : node;

    if (this.selectedNode) {
      this.nodeNameControl.enable();
      this.selectedIconName = this.selectedNode.icon;
    } else {
      this.nodeNameControl.disable();
      this.selectedIconName = undefined;
    }

    this.nodeNameControl.setValue(this.selectedNode?.label!);
  }

  onAddItems(isFolder = false) {
    if (this.selectedNode) {
      this.addNewItem(this.selectedNode, this.flatNodeMap.get(this.selectedNode)!.children.length, isFolder);
    }
  }

  onApply() {
    if (!this.selectedNode) {
      return;
    }

    this.selectedNode.label = this.nodeNameControl.value!;
    this.selectedNode.icon = this.selectedIconName;
    this.selectedNode = undefined;
  }

  onSelectIcon(iconName: string) {
    this.selectedIconName = iconName;
  }

  private addNewItem(node: TreeItemNode, childTotal: number, isFolder = false) {
    const parentNode = this.flatNodeMap.get(node)!;

    for (let i = 0; i < COUNT_ITEMS_FOR_ADD; i++) {
      const id = uuid.v4();
      const label = `${isFolder ? 'folder' : 'file'}-${i + childTotal}`;

      this.treeNodeService.insertItem(
        parentNode,
        new TreeItemNode({ id, label, icon: isFolder ? 'folder' : 'panorama' }),
        isFolder,
      );
    }

    this.flatTreeControl.expand(node);

    this.expandCollapseParent(node);
  }

  private expandCollapseParent(node: TreeItemNode) {
    // TODO: need collapse and expand parent node for show expand arrow
    let foundIndex = node.level === 1 ? 1 : -1;

    if (foundIndex < 0) {
      this.flatTreeControl.dataNodes.find((it, index) => {
        if (it.id === node.id) {
          foundIndex = index;
        }

        return it.id === node.id;
      });
    }

    this.flatTreeControl.collapse(this.flatTreeControl.dataNodes[foundIndex - 1]);
    this.flatTreeControl.expand(this.flatTreeControl.dataNodes[foundIndex - 1]);
  }
}
