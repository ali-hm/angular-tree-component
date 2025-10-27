import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  forwardRef,
  signal,
  computed,
  effect,
  Injector,
  input,
  inject
} from '@angular/core';
import { TreeVirtualScroll } from '../models/tree-virtual-scroll.model';
import { TreeNode } from '../models/tree-node.model';
import { TreeModel } from '../models/tree.model';
import { NgTemplateOutlet } from '@angular/common';
import { TreeNodeDropSlot } from './tree-node-drop-slot.component';
import { TreeNodeWrapperComponent } from './tree-node-wrapper.component';
import { TreeAnimateOpenDirective } from '../directives/tree-animate-open.directive';
import { LoadingComponent } from './loading.component';

@Component({
  selector: 'tree-node-children',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
    <div
      [class.tree-children]="true"
      [class.tree-children-no-padding]="node().options.levelPadding"
      *treeAnimateOpen="
        node().isExpanded;
        speed: node().options.animateSpeed;
        acceleration: node().options.animateAcceleration;
        enabled: node().options.animateExpand
      "
    >
      @if (children()) {
      <tree-node-collection
        [nodes]="children()"
        [templates]="templates()"
        [treeModel]="node().treeModel"
      >
      </tree-node-collection>
      } @if (!children()) {
      <tree-loading-component
        [style.padding-left]="node().getNodePadding()"
        class="tree-node-loading"
        [template]="templates().loadingTemplate"
        [node]="node()"
      ></tree-loading-component>
      }
    </div>
  `,
  imports: [
    TreeAnimateOpenDirective,
    forwardRef(() => TreeNodeCollectionComponent),
    LoadingComponent
  ]
})
export class TreeNodeChildrenComponent {
  readonly node = input<TreeNode>();
  readonly templates = input<any>(undefined);

  children = computed(() => this.node().children);
}

@Component({
  selector: 'tree-node-collection',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [style.margin-top]="marginTop()">
      @for (node of viewportNodes(); track trackNode(i, node); let i = $index) {
      <tree-node [node]="node" [index]="i" [templates]="templates()">
      </tree-node>
      }
    </div>
  `,
  imports: [forwardRef(() => TreeNodeComponent)]
})
export class TreeNodeCollectionComponent implements OnInit, OnDestroy {
  readonly nodes = input<TreeNode[]>(undefined);
  readonly treeModel = input<TreeModel>(undefined);
  private injector = inject(Injector);

  private virtualScroll: TreeVirtualScroll;
  readonly templates = input(undefined);

  viewportNodes = signal<TreeNode[]>([]);

  marginTop = computed(() => {
    const nodes = this.viewportNodes();
    const firstNode = nodes && nodes.length && nodes[0];
    const relativePosition =
      firstNode && firstNode.parent
        ? firstNode.position -
          firstNode.parent.position -
          firstNode.parent.getSelfHeight()
        : 0;

    return `${relativePosition}px`;
  });

  private _disposeEffects: (() => void)[] = [];

  ngOnInit() {
    this.virtualScroll = this.treeModel().virtualScroll;

    const viewportEffect = effect(
      () => {
        const nodes = this.nodes();
        if (nodes && this.virtualScroll) {
          const viewportNodes = this.virtualScroll.getViewportNodes(nodes);
          this.viewportNodes.set(viewportNodes);
        }
      },
      { injector: this.injector }
    );

    this._disposeEffects = [() => viewportEffect.destroy()];
  }

  ngOnDestroy() {
    this._disposeEffects.forEach(d => d());
  }

  trackNode(index, node) {
    return node.id;
  }
}

@Component({
  selector: 'TreeNode, tree-node',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
    @if (!treeNodeFullTemplate()) {
    <div
      [class]="node().getClass()"
      [class.tree-node]="true"
      [class.tree-node-expanded]="node().isExpanded && node().hasChildren"
      [class.tree-node-collapsed]="node().isCollapsed && node().hasChildren"
      [class.tree-node-leaf]="node().isLeaf"
      [class.tree-node-active]="node().isActive"
      [class.tree-node-focused]="node().isFocused"
    >
      @if (index() === 0) {
      <tree-node-drop-slot
        [dropIndex]="node().index"
        [node]="node().parent"
      ></tree-node-drop-slot>
      }

      <tree-node-wrapper
        [node]="node()"
        [index]="index()"
        [templates]="templates()"
      ></tree-node-wrapper>

      <tree-node-children
        [node]="node()"
        [templates]="templates()"
      ></tree-node-children>
      <tree-node-drop-slot
        [dropIndex]="node().index + 1"
        [node]="node().parent"
      ></tree-node-drop-slot>
    </div>
    }
    <ng-container
      [ngTemplateOutlet]="treeNodeFullTemplate()"
      [ngTemplateOutletContext]="{
        $implicit: node(),
        node: node(),
        index: index(),
        templates: templates()
      }"
    >
    </ng-container>
  `,
  imports: [
    TreeNodeDropSlot,
    TreeNodeWrapperComponent,
    TreeNodeChildrenComponent,
    NgTemplateOutlet
  ]
})
export class TreeNodeComponent {
  readonly node = input<TreeNode>(undefined);
  readonly index = input<number>(undefined);
  readonly templates = input<any>();
  treeNodeFullTemplate = computed(() => this.templates().treeNodeFullTemplate);
}
