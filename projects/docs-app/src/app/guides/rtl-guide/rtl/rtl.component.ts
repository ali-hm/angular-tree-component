import { Component } from '@angular/core';
import { TreeModule } from 'angular-tree-component';

@Component({
    selector: 'app-rtl',
    templateUrl: './rtl.component.html',
    styleUrls: ['./rtl.component.scss'],
    imports: [TreeModule]
})
export class RtlComponent {

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
