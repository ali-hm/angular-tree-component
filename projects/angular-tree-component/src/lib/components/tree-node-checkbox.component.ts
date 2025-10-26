import { Component, ViewEncapsulation, input } from '@angular/core';
import { TreeNode } from '../models/tree-node.model';

@Component({
  selector: 'tree-node-checkbox',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
    <input
      class="tree-node-checkbox"
      type="checkbox"
      (click)="node().mouseAction('checkboxClick', $event)"
      [checked]="node().isSelected"
      [indeterminate]="node().isPartiallySelected"
    />
  `,
  imports: []
})
export class TreeNodeCheckboxComponent {
  readonly node = input<TreeNode>(undefined);
}
