import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { TreeNodeInterface } from '@interfaces';

@Component({
  selector: 'tree-node',
  standalone: true,
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    CdkDropList,
    CdkDrag,
  ],
})
export class TreeNodeComponent {
  @Input() nodes?: TreeNodeInterface[];
  @Input() selectedNode?: TreeNodeInterface;
  @Input() draggableNode?: TreeNodeInterface;
  @Input() childrenKey: string = 'children';
  @Input() path: string[] = [];

  @Output() selectedNodeChange: EventEmitter<TreeNodeInterface> = new EventEmitter();
  @Output() dragNodeStart: EventEmitter<{ event: DragEvent, node: TreeNodeInterface }> = new EventEmitter();
  @Output() dragNodeOver: EventEmitter<{ event: DragEvent, node: TreeNodeInterface }> = new EventEmitter();
  @Output() dragNodeDrop: EventEmitter<{ event: DragEvent, node: TreeNodeInterface }> = new EventEmitter();
  @Output() dragNodeEnd: EventEmitter<{ event: DragEvent }> = new EventEmitter();
}
