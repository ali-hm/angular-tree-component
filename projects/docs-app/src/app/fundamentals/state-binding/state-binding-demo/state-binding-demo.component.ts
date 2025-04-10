import { Component, OnInit } from '@angular/core';
import { ITreeState, TreeModule } from 'angular-tree-component';

@Component({
    selector: 'app-state-binding-demo',
    templateUrl: './state-binding-demo.component.html',
    styleUrls: ['./state-binding-demo.component.scss'],
    imports: [TreeModule]
})
export class StateBindingDemoComponent {

  get state(): ITreeState {
    return localStorage.treeState && JSON.parse(localStorage.treeState);
  }
  set state(state: ITreeState) {
    localStorage.treeState = JSON.stringify(state);
  }

  options = {
    getChildren: () => new Promise((resolve) => {
      setTimeout(() => resolve([
        { id: 5, name: 'child2.1', children: [] },
        { id: 6, name: 'child2.2', children: [
            { id: 7, name: 'grandchild2.2.1' }
          ] }
      ]), 2000);
    })
  };

  nodes = [
    {
      id: 1,
      name: 'root1',
      children: [
        { id: 2, name: 'child1' },
        { id: 3, name: 'child2' }
      ]
    },
    {
      id: 4,
      name: 'root2',
      hasChildren: true
    }
  ];

}
