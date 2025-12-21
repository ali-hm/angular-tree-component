import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TreeModule, TreeModel, TreeNode } from 'angular-tree-component';
import { nodeMock } from './nodes.model';

@Component({
  selector: 'app-filter-virtual',
  template: `
    <h2>Filter (virtual scroll)</h2>
    <input
      id="filter"
      #filter
      (keyup)="tree.treeModel.filterNodes(filter.value)"
      placeholder="filter nodes"
    />
    <button (click)="tree.treeModel.clearFilter()">Clear Filter</button>
    <div style="height: 400px; width: 400px; ">
      <tree-root
        #tree
        [focused]="true"
        [options]="options"
        [nodes]="nodes"
      ></tree-root>
    </div>

    <input
      id="filter2"
      #filter2
      (keyup)="tree.treeModel.filterNodes(filter2.value, false)"
      placeholder="filter nodes"
    />

    <h3>Filter By Function (Fuzzy Search)</h3>
    <input
      id="filter3"
      #filter3
      (keyup)="filterFn(filter3.value, tree.treeModel)"
      placeholder="filter nodes by fuzzy search"
    />
 `,
  styles: [],
  imports: [TreeModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterVirtualComponent {
  options = {
    useCheckbox: false,
    useVirtualScroll: true,
    nodeHeight: 22
  };

  nodes = [nodeMock];

  filterFn(value: string, treeModel: TreeModel) {
    treeModel.filterNodes((node: TreeNode) => fuzzysearch(value, node.data.name));
  }
}

function fuzzysearch(needle: string, haystack: string) {
  const haystackLC = haystack.toLowerCase();
  const needleLC = needle.toLowerCase();

  const hlen = haystack.length;
  const nlen = needleLC.length;

  if (nlen > hlen) {
    return false;
  }
  if (nlen === hlen) {
    return needleLC === haystackLC;
  }
  outer: for (let i = 0, j = 0; i < nlen; i++) {
    const nch = needleLC.charCodeAt(i);

    while (j < hlen) {
      if (haystackLC.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}
