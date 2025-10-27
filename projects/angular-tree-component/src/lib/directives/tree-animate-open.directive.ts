import {
  Directive,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  input,
  effect,
  inject
} from '@angular/core';

const EASE_ACCELERATION = 1.005;

@Directive({ selector: '[treeAnimateOpen]' })
export class TreeAnimateOpenDirective {
  private renderer = inject(Renderer2);
  private templateRef = inject<TemplateRef<any>>(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  readonly isOpen = input<boolean>(undefined, { alias: 'treeAnimateOpen' });
  readonly animateSpeed = input<number>(undefined, {
    alias: 'treeAnimateOpenSpeed'
  });
  readonly animateAcceleration = input<number>(undefined, {
    alias: 'treeAnimateOpenAcceleration'
  });
  readonly isEnabled = input<boolean>(undefined, {
    alias: 'treeAnimateOpenEnabled'
  });

  private innerElement: any;
  private previousIsOpen: boolean;

  constructor() {
    effect(() => {
      const value = this.isOpen();
      if (value) {
        this._show();
        if (this.isEnabled() && this.previousIsOpen === false) {
          this._animateOpen();
        }
      } else {
        this.isEnabled() ? this._animateClose() : this._hide();
      }
      this.previousIsOpen = !!value;
    });
  }

  private _show() {
    if (this.innerElement) return;

    // create child view
    this.innerElement = this.viewContainerRef.createEmbeddedView(
      this.templateRef
    ).rootNodes[0];
  }

  private _hide() {
    this.viewContainerRef.clear();
    this.innerElement = null;
  }

  private _animateOpen() {
    let delta = this.animateSpeed();
    let ease = this.animateAcceleration();
    let maxHeight = 0;

    // set height to 0
    this.renderer.setStyle(this.innerElement, 'max-height', `0`);

    // increase maxHeight until height doesn't change
    setTimeout(() => {
      // Allow inner element to create its content
      const i = setInterval(() => {
        if (!this.isOpen() || !this.innerElement) return clearInterval(i);

        maxHeight += delta;
        const roundedMaxHeight = Math.round(maxHeight);

        this.renderer.setStyle(
          this.innerElement,
          'max-height',
          `${roundedMaxHeight}px`
        );
        const height = this.innerElement.getBoundingClientRect
          ? this.innerElement.getBoundingClientRect().height
          : 0; // TBD use renderer

        delta *= ease;
        ease *= EASE_ACCELERATION;
        if (height < roundedMaxHeight) {
          // Make maxHeight auto because animation finished and container might change height later on
          this.renderer.setStyle(this.innerElement, 'max-height', null);
          clearInterval(i);
        }
      }, 17);
    });
  }

  private _animateClose() {
    if (!this.innerElement) return;

    let delta = this.animateSpeed();
    let ease = this.animateAcceleration();
    let height = this.innerElement.getBoundingClientRect().height; // TBD use renderer

    // slowly decrease maxHeight to 0, starting from current height
    const i = setInterval(() => {
      if (this.isOpen() || !this.innerElement) return clearInterval(i);

      height -= delta;
      this.renderer.setStyle(this.innerElement, 'max-height', `${height}px`);
      delta *= ease;
      ease *= EASE_ACCELERATION;

      if (height <= 0) {
        // after animation complete - remove child element
        this.viewContainerRef.clear();
        this.innerElement = null;
        clearInterval(i);
      }
    }, 17);
  }
}
