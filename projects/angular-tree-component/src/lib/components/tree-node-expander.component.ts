import {
  Component,
  computed,
  input,
  ViewEncapsulation
} from '@angular/core';
import { TreeNode } from '../models/tree-node.model';

@Component({
  selector: 'tree-node-expander',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
    @if (hasChildren()) {
    <span
      [class.toggle-children-wrapper-expanded]="node().isExpanded"
      [class.toggle-children-wrapper-collapsed]="node().isCollapsed"
      class="toggle-children-wrapper"
      (click)="node().mouseAction('expanderClick', $event)"
    >
      <span class="toggle-children"></span>
    </span>
    } @if (!hasChildren()) {
    <span class="toggle-children-placeholder"></span>
    }
  `,
  imports: []
})
export class TreeNodeExpanderComponent {
  readonly node = input<TreeNode>();
  readonly hasChildren = computed(() => this.node().hasChildren);
}
