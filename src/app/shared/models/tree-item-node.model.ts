export class TreeItemNode {
  id: string;
  label: string;
  icon?: string;
  level: number = -1;
  expandable: boolean = false;
  children: TreeItemNode[] = [];

  constructor(data: Partial<TreeItemNode> = {}) {
    Object.assign(this, data, {
      children: data.children ? data.children.map(it => new TreeItemNode(it)) : [],
    });
  }
}
