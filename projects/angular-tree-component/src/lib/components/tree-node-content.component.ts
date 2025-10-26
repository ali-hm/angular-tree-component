import {
  Component,
  ViewEncapsulation,
  TemplateRef,
  input
} from '@angular/core';
import { TreeNode } from '../models/tree-node.model';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'tree-node-content',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (!template()) {
    <span>{{ node().displayField }}</span>
    }
    <ng-container
      [ngTemplateOutlet]="template()"
      [ngTemplateOutletContext]="{
        $implicit: node(),
        node: node(),
        index: index()
      }"
    >
    </ng-container>
  `,
  imports: [NgTemplateOutlet]
})
export class TreeNodeContent {
  readonly node = input<TreeNode>(undefined);
  readonly index = input<number>(undefined);
  readonly template = input<TemplateRef<any>>(undefined);
}
