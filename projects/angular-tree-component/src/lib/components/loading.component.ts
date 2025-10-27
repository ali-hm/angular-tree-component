import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  input
} from '@angular/core';
import { TreeNode } from '../models/tree-node.model';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'tree-loading-component',
  template: `
    @if (!template()) {
    <span>loading...</span>
    }
    <ng-container
      [ngTemplateOutlet]="template()"
      [ngTemplateOutletContext]="{ $implicit: node() }"
    >
    </ng-container>
  `,
  imports: [NgTemplateOutlet]
})
export class LoadingComponent {
  readonly template = input<TemplateRef<any>>(undefined);
  readonly node = input<TreeNode>(undefined);
}
