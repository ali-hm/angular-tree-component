import { Component, OnInit } from '@angular/core';
import { ITreeOptions, TreeModule } from 'angular-tree-component';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-columns',
    templateUrl: './columns.component.html',
    styleUrls: ['./columns.component.scss'],
    imports: [NgFor, TreeModule]
})
export class ColumnsComponent implements OnInit {

  nodes = [
    {
      name: 'Region 1 Headquarter',
      city: 'Central City',
      zipCode: '00001',
      children: [
        { name: 'Region 1 Subdivision 1', city: 'Highway Town', zipCode: '00002' },
        { name: 'Region 1 Subdivision 2', city: 'Main Town', zipCode: '00003' }
      ]
    },
    {
      name: 'Region 2 Headquarter',
      city: 'Beach City',
      zipCode: '00010',
      children: [
        { name: 'Region 2 Subdivision 1', city: 'Palm Town', zipCode: '00011', children: [] },
        { name: 'Region 2 Subdivision 2', city: 'Sunny Town', zipCode: '00012', children: [
            { name: 'Customer Subdivision 2/2', city: 'Sunny Town', zipCode: '00012' }
          ]
        }
      ]
    },
    { name: 'Region 3 Headquarter', city: 'River City', zipCode: '00100' },
  ];

  options: ITreeOptions = {
    displayField: 'name',
    useVirtualScroll: false,
    nodeHeight: 25,
    allowDrag: false,
    allowDrop: false
  };

  columns = ['city', 'zipCode'];

  constructor() { }

  ngOnInit(): void {
  }

}
