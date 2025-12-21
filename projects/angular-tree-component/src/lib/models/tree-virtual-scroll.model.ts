import { Injectable, Injector, effect, inject, signal } from '@angular/core';
import { TreeModel } from './tree.model';
import { TREE_EVENTS } from '../constants/events';

const Y_OFFSET = 500; // Extra pixels outside the viewport, in each direction, to render nodes in
const Y_EPSILON = 150; // Minimum pixel change required to recalculate the rendered nodes

@Injectable()
export class TreeVirtualScroll {
  private treeModel = inject(TreeModel);

  private _dispose: (() => void)[] = [];

  private _yBlocks = signal<number>(0);
  private _x = signal<number>(0);
  private _viewportHeight = signal<number | null>(null);
  viewport = null;

  get yBlocks() { return this._yBlocks(); }
  set yBlocks(value: number) { this._yBlocks.set(value); }

  get x() { return this._x(); }
  set x(value: number) { this._x.set(value); }

  get viewportHeight() { return this._viewportHeight(); }
  set viewportHeight(value: number | null) { this._viewportHeight.set(value); }

  get y() {
    return this.yBlocks * Y_EPSILON;
  }

  get totalHeight() {
    const vRoot = this.treeModel['_virtualRoot']();
    return vRoot ? vRoot.height : 0;
  }

  constructor() {
    const treeModel = this.treeModel;

    treeModel.virtualScroll = this;
  }

  fireEvent(event) {
    this.treeModel.fireEvent(event);
  }

  init() {
    const fn = this.recalcPositions.bind(this);

    fn();
    this.treeModel.subscribe(TREE_EVENTS.loadNodeChildren, fn);
  }

  setupWatchers(injector: Injector) {
    const fn = this.recalcPositions.bind(this);

    const fixScrollEffect = effect(() => {
      const yBlocks = this._yBlocks();
      const totalHeight = this.totalHeight;
      const viewportHeight = this._viewportHeight();

      this.fixScroll();
    }, { injector });

    const rootsEffect = effect(() => {
      const roots = this.treeModel.roots;
      if (roots) {
        fn();
      }
    }, { injector });

    const expandedEffect = effect(() => {
      const expandedIds = this.treeModel['_expandedNodeIds']();
      fn();
    }, { injector });

    const hiddenEffect = effect(() => {
      const hiddenIds = this.treeModel['_hiddenNodeIds']();
      fn();
    }, { injector });

    this._dispose = [
      () => fixScrollEffect.destroy(),
      () => rootsEffect.destroy(),
      () => expandedEffect.destroy(),
      () => hiddenEffect.destroy()
    ];
  }

  isEnabled() {
    return this.treeModel.options.useVirtualScroll;
  }

  private _setYBlocks(value) {
    this.yBlocks = value;
  }

  recalcPositions() {
    const vRoot = this.treeModel['_virtualRoot']();
    if (vRoot) {
      const visibleRoots = this.treeModel.getVisibleRoots();
      const newHeight = this._getPositionAfter(visibleRoots, 0);
      vRoot.height = newHeight;
    }
  }

  private _getPositionAfter(nodes, startPos) {
    let position = startPos;

    nodes.forEach((node) => {
      node.position = position;
      position = this._getPositionAfterNode(node, position);
    });
    return position;
  }

  private _getPositionAfterNode(node, startPos) {
    let position = node.getSelfHeight() + startPos;

    if (node.children && node.isExpanded) { // TBD: consider loading component as well
      const visibleChildren = node.visibleChildren;
      position = this._getPositionAfter(visibleChildren, position);
    }
    node.height = position - startPos;
    return position;
  }


  clear() {
    this._dispose.forEach((d) => d());
  }

  setViewport(viewport) {
    Object.assign(this, {
      viewport,
      x: viewport.scrollLeft,
      yBlocks: Math.round(viewport.scrollTop / Y_EPSILON),
      viewportHeight: viewport.getBoundingClientRect ? viewport.getBoundingClientRect().height : 0
    });
  }

  scrollIntoView(node, force, scrollToMiddle = true) {
    if (node.options.scrollContainer) {
      const scrollContainer = node.options.scrollContainer;
      const scrollContainerHeight = scrollContainer.getBoundingClientRect().height;
      const scrollContainerTop = scrollContainer.getBoundingClientRect().top;
      const nodeTop = this.viewport.getBoundingClientRect().top + node.position - scrollContainerTop;

      if (force || // force scroll to node
        nodeTop < scrollContainer.scrollTop || // node is above scroll container
        nodeTop + node.getSelfHeight() > scrollContainer.scrollTop + scrollContainerHeight) { // node is below container
        scrollContainer.scrollTop = scrollToMiddle ?
          nodeTop - scrollContainerHeight / 2 : // scroll to middle
          nodeTop; // scroll to start
      }
    } else {
      if (force || // force scroll to node
        node.position < this.y || // node is above viewport
        node.position + node.getSelfHeight() > this.y + this.viewportHeight) { // node is below viewport
        if (this.viewport) {
          this.viewport.scrollTop = scrollToMiddle ?
          node.position - this.viewportHeight / 2 : // scroll to middle
          node.position; // scroll to start

          this._setYBlocks(Math.floor(this.viewport.scrollTop / Y_EPSILON));
        }
      }
    }
  }

  getViewportNodes(nodes) {
    if (!nodes) return [];

    const visibleNodes = nodes.filter((node) => !node.isHidden);

    if (!this.isEnabled()) return visibleNodes;

    if (!this.viewportHeight || !visibleNodes.length) return [];

    // When loading children async this method is called before their height and position is calculated.
    // In that case firstIndex === 0 and lastIndex === visibleNodes.length - 1 (e.g. 1000),
    // which means that it loops through every visibleNodes item and push them into viewportNodes array.
    // We can prevent nodes from being pushed to the array and wait for the appropriate calculations to take place
    const lastVisibleNode = visibleNodes.slice(-1)[0]
    if (!lastVisibleNode.height && lastVisibleNode.position === 0) return [];

    // Search for first node in the viewport using binary search
    // Look for first node that starts after the beginning of the viewport (with buffer)
    // Or that ends after the beginning of the viewport
    const firstIndex = binarySearch(visibleNodes, (node) => {
      return (node.position + Y_OFFSET > this.y) ||
             (node.position + node.height > this.y);
    });

    // Search for last node in the viewport using binary search
    // Look for first node that starts after the end of the viewport (with buffer)
    const lastIndex = binarySearch(visibleNodes, (node) => {
      return node.position - Y_OFFSET > this.y + this.viewportHeight;
    }, firstIndex);

    const viewportNodes = [];

    for (let i = firstIndex; i <= lastIndex; i++) {
      viewportNodes.push(visibleNodes[i]);
    }

    return viewportNodes;
  }

  fixScroll() {
    const maxY = Math.max(0, this.totalHeight - this.viewportHeight);

    if (this.y < 0) this._setYBlocks(0);
    if (this.y > maxY) this._setYBlocks(maxY / Y_EPSILON);
  }
}

function binarySearch(nodes, condition, firstIndex = 0) {
  let index = firstIndex;
  let toIndex = nodes.length - 1;

  while (index !== toIndex) {
    let midIndex = Math.floor((index + toIndex) / 2);

    if (condition(nodes[midIndex])) {
      toIndex = midIndex;
    }
    else {
      if (index === midIndex) index = toIndex;
      else index = midIndex;
    }
  }
  return index;
}
