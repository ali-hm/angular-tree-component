import { Component, ViewEncapsulation } from '@angular/core';
import { TreeModule } from 'angular-tree-component';

@Component({
    selector: 'app-basictree',
    template: `
    <tree-root [focused]="true" [nodes]="nodes" [options]="options"></tree-root>
  `,
    encapsulation: ViewEncapsulation.None,
    styles: [],
    imports: [TreeModule]
})
export class RtlTreeComponent {
  options = {
    rtl: true
  };

  nodes = [
    {
      name: 'עץ תיקיות',
      children: [
        { name: 'קובץ 1' },
        { name: 'קובץ 2' }
      ]
    },
    {
      name: 'עוד עץ',
      children: [
        { name: 'עלה', children: [] },
        { name: 'ענף', children: [
          {name: 'בן של ענף'}
        ] }
      ]
    }
  ];
}
