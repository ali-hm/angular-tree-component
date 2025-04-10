import { Component } from '@angular/core';
import { TreeModule } from 'angular-tree-component';

@Component({
    selector: 'app-basic-tree',
    templateUrl: './basic-tree.component.html',
    styleUrls: ['./basic-tree.component.scss'],
    imports: [TreeModule]
})
export class BasicTreeComponent {

  nodes = [
    {
      name: 'root1',
      children: [
        { name: 'child1' },
        { name: 'child2' }
      ]
    },
    {
      name: 'root2',
      children: [
        { name: 'child2.1', children: [] },
        { name: 'child2.2', children: [
            {name: 'grandchild2.2.1'}
          ] }
      ]
    },
    { name: 'root3' },
    { name: 'root4', children: [] },
    { name: 'root5', children: null }
  ];

}
