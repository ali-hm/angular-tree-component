import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  Renderer2,
  input,
  inject,
  output,
  effect
} from '@angular/core';
import { TreeDraggedElement } from '../models/tree-dragged-element.model';

const DRAG_OVER_CLASS = 'is-dragging-over';
const DRAG_DISABLED_CLASS = 'is-dragging-over-disabled';

@Directive({ selector: '[treeDrop]' })
export class TreeDropDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private treeDraggedElement = inject(TreeDraggedElement);
  private ngZone = inject(NgZone);

  readonly allowDragoverStyling = input(true);
  readonly treeAllowDrop = input<boolean | Function>(undefined);
  readonly onDropCallback = output<{event: DragEvent, element: any}>({ alias: 'treeDrop' });
  readonly onDragOverCallback = output<{event: DragEvent, element: any}>({ alias: 'treeDropDragOver' });
  readonly onDragLeaveCallback = output<{event: DragEvent, element: any}>({ alias: 'treeDropDragLeave' });
  readonly onDragEnterCallback = output<{event: DragEvent, element: any}>({ alias: 'treeDropDragEnter' });
  private readonly dragOverEventHandler: (ev: DragEvent) => void;
  private readonly dragEnterEventHandler: (ev: DragEvent) => void;
  private readonly dragLeaveEventHandler: (ev: DragEvent) => void;

  private _allowDrop = (element, $event) => true;

  allowDrop($event) {
    return this._allowDrop(this.treeDraggedElement.get(), $event);
  }

  constructor() {
    this.dragOverEventHandler = this.onDragOver.bind(this);
    this.dragEnterEventHandler = this.onDragEnter.bind(this);
    this.dragLeaveEventHandler = this.onDragLeave.bind(this);
    
    effect(() => {
      const allowDrop = this.treeAllowDrop();
      if (allowDrop instanceof Function) {
        this._allowDrop = allowDrop as (element: any, $event: any) => boolean;
      }
      else if (allowDrop !== undefined) {
        this._allowDrop = (element, $event) => allowDrop;
      }
    });
  }

  ngAfterViewInit() {
    let el: HTMLElement = this.el.nativeElement;
    this.ngZone.runOutsideAngular(() => {
      el.addEventListener('dragover', this.dragOverEventHandler);
      el.addEventListener('dragenter', this.dragEnterEventHandler);
      el.addEventListener('dragleave', this.dragLeaveEventHandler);
    });
  }

  ngOnDestroy() {
    let el: HTMLElement = this.el.nativeElement;
    el.removeEventListener('dragover', this.dragOverEventHandler);
    el.removeEventListener('dragenter', this.dragEnterEventHandler);
    el.removeEventListener('dragleave', this.dragLeaveEventHandler);
  }

  onDragOver($event) {
    if (!this.allowDrop($event)) {
      if (this.allowDragoverStyling()) {
        return this.addDisabledClass();
      }
      return;
    }

    this.onDragOverCallback.emit({event: $event, element: this.treeDraggedElement.get()});

    $event.preventDefault();
    if (this.allowDragoverStyling()) {
      this.addClass();
    }
  }

  onDragEnter($event) {
    if (!this.allowDrop($event)) return;

    $event.preventDefault();
    this.onDragEnterCallback.emit({event: $event, element: this.treeDraggedElement.get()});
  }

  onDragLeave($event) {
    if (!this.allowDrop($event)) {
      if (this.allowDragoverStyling()) {
        return this.removeDisabledClass();
      }
      return;
    }
    this.onDragLeaveCallback.emit({event: $event, element: this.treeDraggedElement.get()});

    if (this.allowDragoverStyling()) {
      this.removeClass();
    }
  }

  @HostListener('drop', ['$event']) onDrop($event) {
    if (!this.allowDrop($event)) return;

    $event.preventDefault();
    this.onDropCallback.emit({event: $event, element: this.treeDraggedElement.get()});

    if (this.allowDragoverStyling()) {
      this.removeClass();
    }
    this.treeDraggedElement.set(null);
  }

  private addClass() {
    this.renderer.addClass(this.el.nativeElement, DRAG_OVER_CLASS);
  }

  private removeClass() {
    this.renderer.removeClass(this.el.nativeElement, DRAG_OVER_CLASS);
  }

  private addDisabledClass() {
    this.renderer.addClass(this.el.nativeElement, DRAG_DISABLED_CLASS);
  }

  private removeDisabledClass() {
    this.renderer.removeClass(this.el.nativeElement, DRAG_DISABLED_CLASS);
  }
}
