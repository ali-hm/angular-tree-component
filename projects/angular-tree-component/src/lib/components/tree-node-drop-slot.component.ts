import { Component, ViewEncapsulation, input } from '@angular/core';
import { TreeNode } from '../models/tree-node.model';
import { TreeDropDirective } from '../directives/tree-drop.directive';

@Component({
  selector: 'TreeNodeDropSlot, tree-node-drop-slot',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
    <div
      class="node-drop-slot"
      (treeDrop)="onDrop($event)"
      [treeAllowDrop]="allowDrop.bind(this)"
      [allowDragoverStyling]="true"
    ></div>
  `,
  imports: [TreeDropDirective]
})
export class TreeNodeDropSlot {
  readonly node = input<TreeNode>(undefined);
  readonly dropIndex = input<number>(undefined);

  onDrop($event) {
    this.node().mouseAction('drop', $event.event, {
      from: $event.element,
      to: { parent: this.node(), index: this.dropIndex() }
    });
  }

  allowDrop(element, $event) {
    return this.node().options.allowDrop(
      element,
      { parent: this.node(), index: this.dropIndex() },
      $event
    );
  }
}
