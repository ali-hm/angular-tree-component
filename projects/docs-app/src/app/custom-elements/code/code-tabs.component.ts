/* tslint:disable component-selector */
import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CodeComponent } from './code.component';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { NgFor } from '@angular/common';

export interface TabInfo {
  class: string;
  code: string;
  path: string;
  region: string;

  header?: string;
  language?: string;
  linenums?: string;
}

/**
 * Renders a set of tab group of code snippets.
 *
 * The innerHTML of the `<code-tabs>` component should contain `<code-pane>` elements.
 * Each `<code-pane>` has the same interface as the embedded `<code-example>` component.
 * The optional `linenums` attribute is the default `linenums` for each code pane.
 */
@Component({
    selector: 'code-tabs',
    template: `
    <!-- Use content projection so that the provided HTML's code-panes can be split into tabs -->
    <div #content style="display: none"><ng-content></ng-content></div>
    <mat-card>
      <mat-tab-group class="code-tab-group" [disableRipple]="true">
        <mat-tab style="overflow-y: hidden;" *ngFor="let tab of tabs">
          <ng-template mat-tab-label>
            <span class="{{ tab.class }}">{{ tab.header }}</span>
          </ng-template>
          <aio-code class="{{ tab.class }}"
                    [language]="tab.language"
                    [linenums]="tab.linenums"
                    [path]="tab.path"
                    [region]="tab.region"
                    [header]="tab.header">
          </aio-code>
        </mat-tab>
      </mat-tab-group>
    </mat-card>
  `,
    imports: [MatCard, MatTabGroup, NgFor, MatTab, MatTabLabel, CodeComponent]
})
export class CodeTabsComponent implements OnInit, AfterViewInit {
  tabs: TabInfo[];

  @Input() linenums: string | undefined;

  @ViewChild('content', { static: true }) content: ElementRef<HTMLDivElement>;

  @ViewChildren(CodeComponent) codeComponents: QueryList<CodeComponent>;

  ngOnInit() {
    this.tabs = [];
    const codeExamples = Array.from(this.content.nativeElement.querySelectorAll('code-pane'));

    for (const tabContent of codeExamples) {
      this.tabs.push(this.getTabInfo(tabContent));
    }
  }

  ngAfterViewInit() {
    this.codeComponents.toArray().forEach((codeComponent, i) => {
      codeComponent.code = this.tabs[i].code;
    });
  }

  /** Gets the extracted TabInfo data from the provided code-pane element. */
  private getTabInfo(tabContent: Element): TabInfo {
    return {
      class: tabContent.getAttribute('class') || '',
      code: tabContent.innerHTML,
      path: tabContent.getAttribute('path') || '',
      region: tabContent.getAttribute('region') || '',

      header: tabContent.getAttribute('header') || undefined,
      language: tabContent.getAttribute('language') || undefined,
      linenums: tabContent.getAttribute('linenums') || this.linenums,
    };
  }
}
