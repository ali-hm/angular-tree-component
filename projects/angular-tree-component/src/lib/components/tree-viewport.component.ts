import {
  Component,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Injector,
  Renderer2,
  afterNextRender,
  inject,
  computed
} from '@angular/core';
import { TreeVirtualScroll } from '../models/tree-virtual-scroll.model';
import { TREE_EVENTS } from '../constants/events';

@Component({
  selector: 'tree-viewport',
  styles: [],
  providers: [TreeVirtualScroll],
  template: `
    <div [style.height]="totalHeight()">
      <ng-content></ng-content>
    </div>
  `,
  imports: []
})
export class TreeViewportComponent implements AfterViewInit, OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  virtualScroll = inject(TreeVirtualScroll);
  private injector = inject(Injector);
  private renderer = inject(Renderer2);

  // Computed signal for total height - ensures reactive updates
  totalHeight = computed(() => {
    if (!this.virtualScroll.isEnabled()) {
      return 'auto';
    }
    return this.virtualScroll.totalHeight + 'px';
  });

  setViewport = this.throttle(() => {
    this.virtualScroll.setViewport(this.elementRef.nativeElement);
  }, 17);

  private readonly scrollEventHandler: ($event: Event) => void;
  private removeScrollListener: (() => void) | null = null;

  constructor() {
    this.scrollEventHandler = this.setViewport.bind(this);
  }

  ngOnInit() {
    this.virtualScroll.init();
    this.virtualScroll.setupWatchers(this.injector);
  }

  ngAfterViewInit() {
    afterNextRender(() => {
      this.setViewport();
      this.virtualScroll.fireEvent({ eventName: TREE_EVENTS.initialized });
    }, { injector: this.injector });

    const el: HTMLElement = this.elementRef.nativeElement;
    this.removeScrollListener = this.renderer.listen(
      el,
      'scroll',
      this.scrollEventHandler
    );
  }

  ngOnDestroy() {
    this.virtualScroll.clear();
    this.removeScrollListener?.();
    this.removeScrollListener = null;
  }

  private throttle(func, timeFrame) {
    let lastTime = 0;
    return function() {
      let now = Date.now();
      if (now - lastTime >= timeFrame) {
        func();
        lastTime = now;
      }
    };
  }
}
