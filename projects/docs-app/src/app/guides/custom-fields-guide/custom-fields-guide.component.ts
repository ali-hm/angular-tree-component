import { Component } from '@angular/core';
import { CodeExampleComponent } from '../../custom-elements/code/code-example.component';

@Component({
    selector: 'app-custom-fields-guide',
    templateUrl: './custom-fields-guide.component.html',
    styleUrls: ['./custom-fields-guide.component.scss'],
    imports: [CodeExampleComponent]
})
export class CustomFieldsGuideComponent {
  javascript = `
nodes = [
  {
    _id: '1',
    title: 'root1',
    nodes: [{_id: '3', title: 'child1'}]
  },
  {
    _id: '2',
    title: 'root2'
  }
];

options: ITreeOptions = {
  idField: '_id',
  displayField: 'title',
  childrenField: 'nodes'
};`;
}
