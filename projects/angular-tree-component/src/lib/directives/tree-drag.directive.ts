import { AfterViewInit, Directive, DoCheck, ElementRef, HostListener, NgZone, OnDestroy, Renderer2, input, inject } from '@angular/core';
import { TreeDraggedElement } from '../models/tree-dragged-element.model';

const DRAG_OVER_CLASS = 'is-dragging-over';

@Directive({ selector: '[treeDrag]' })
export class TreeDragDirective implements AfterViewInit, DoCheck, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private treeDraggedElement = inject(TreeDraggedElement);
  private ngZone = inject(NgZone);

  readonly draggedElement = input(undefined, { alias: "treeDrag" });
  readonly treeDragEnabled = input(undefined);
  private readonly dragEventHandler: (ev: DragEvent) => void;

  constructor() {
    this.dragEventHandler = this.onDrag.bind(this);
  }

  ngAfterViewInit() {
    let el: HTMLElement = this.el.nativeElement;
    this.ngZone.runOutsideAngular(() => {
      el.addEventListener('drag', this.dragEventHandler);
    });
  }

  ngDoCheck() {
    this.renderer.setAttribute(this.el.nativeElement, 'draggable', this.treeDragEnabled() ? 'true' : 'false');
  }

  ngOnDestroy() {
    let el: HTMLElement = this.el.nativeElement;
    el.removeEventListener('drag', this.dragEventHandler);
  }

  @HostListener('dragstart', ['$event']) onDragStart(ev) {
    // setting the data is required by firefox
    ev.dataTransfer.setData('text', ev.target.id);
    const draggedElement = this.draggedElement();
    this.treeDraggedElement.set(draggedElement);
    if (draggedElement.mouseAction) {
      draggedElement.mouseAction('dragStart', ev);
    }
  }

  onDrag(ev) {
    const draggedElement = this.draggedElement();
    if (draggedElement.mouseAction) {
      draggedElement.mouseAction('drag', ev);
    }
  }

  @HostListener('dragend') onDragEnd() {
    const draggedElement = this.draggedElement();
    if (draggedElement.mouseAction) {
      draggedElement.mouseAction('dragEnd');
    }
    this.treeDraggedElement.set(null);
  }
}
