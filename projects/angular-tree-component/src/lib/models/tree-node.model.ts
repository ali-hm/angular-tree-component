import { signal } from '@angular/core';
import { TreeModel } from './tree.model';
import { TreeOptions } from './tree-options.model';
import { ITreeNode } from '../defs/api';
import { TREE_EVENTS } from '../constants/events';

export class TreeNode implements ITreeNode {
  private _isLoadingChildren = false;

  // Private signals
  private _children = signal<TreeNode[]>(undefined);
  private _index = signal<number>(undefined);
  private _position = signal<number>(0);
  private _height = signal<number>(undefined);

  // Public getters/setters for API compatibility
  get children(): TreeNode[] { return this._children(); }
  set children(value: TreeNode[]) { this._children.set(value); }

  get index(): number { return this._index(); }
  set index(value: number) { this._index.set(value); }

  get position(): number { return this._position(); }
  set position(value: number) { this._position.set(value); }

  get height(): number { return this._height(); }
  set height(value: number) { this._height.set(value); }

  // Computed properties
  get isHidden() { return this.treeModel.isHidden(this); }
  get isExpanded() { return this.treeModel.isExpanded(this); }
  get isActive() { return this.treeModel.isActive(this); }
  get isFocused() { return this.treeModel.isNodeFocused(this); }

  get isSelected() {
    if (this.isSelectable()) {
        return this.treeModel.isSelected(this);
    } else {
      return this.children?.some((node: TreeNode) => node.isSelected);
    }
  }

  get isAllSelected() {
    if (this.isSelectable()) {
      return this.treeModel.isSelected(this);
    } else {
      return this.children?.every((node: TreeNode) => node.isAllSelected);
    }
  }

  get isPartiallySelected() {
    return this.isSelected && !this.isAllSelected;
  }

  get level(): number {
    return this.parent ? this.parent.level + 1 : 0;
  }

  get path(): string[] {
    return this.parent ? [...this.parent.path, this.id] : [];
  }

  get elementRef(): any {
    throw `Element Ref is no longer supported since introducing virtual scroll\n
      You may use a template to obtain a reference to the element`;
  }

  private _originalNode: any;
  get originalNode() { return this._originalNode; };

  constructor(public data: any, public parent: TreeNode, public treeModel: TreeModel, index: number) {
    if (this.id === undefined || this.id === null) {
      this.id = uuid();
    } // Make sure there's a unique id without overriding existing ids to work with immutable data structures
    this.index = index;

    if (this.getField('children')) {
      this._initChildren();
    }
    this.autoLoadChildren();
  }

  // helper get functions:
  get hasChildren(): boolean {
    return !!(this.getField('hasChildren') || (this.children && this.children.length > 0));
  }
  get isCollapsed(): boolean { return !this.isExpanded; }
  get isLeaf(): boolean { return !this.hasChildren; }
  get isRoot(): boolean { return this.parent.data.virtual; }
  get realParent(): TreeNode { return this.isRoot ? null : this.parent; }

  // proxy functions:
  get options(): TreeOptions { return this.treeModel.options; }
  fireEvent(event) { this.treeModel.fireEvent(event); }

  // field accessors:
  get displayField() {
    return this.getField('display');
  }

  get id() {
    return this.getField('id');
  }

  set id(value) {
    this.setField('id', value);
  }

  getField(key) {
    return this.data[this.options[`${key}Field`]];
  }

  setField(key, value) {
    this.data[this.options[`${key}Field`]] = value;
  }

  // traversing:
  _findAdjacentSibling(steps, skipHidden = false) {
    const siblings = this._getParentsChildren(skipHidden);
    const index = siblings.indexOf(this);

    return siblings.length > index + steps ? siblings[index + steps] : null;
  }

  findNextSibling(skipHidden = false) {
    return this._findAdjacentSibling(+1, skipHidden);
  }

  findPreviousSibling(skipHidden = false) {
    return this._findAdjacentSibling(-1, skipHidden);
  }

  getVisibleChildren() {
    return this.visibleChildren;
  }

  get visibleChildren() {
    return (this.children || []).filter((node) => !node.isHidden);
  }

  getFirstChild(skipHidden = false) {
    let children = skipHidden ? this.visibleChildren : this.children;

    return children != null && children.length ? children[0] : null;
  }

  getLastChild(skipHidden = false) {
    let children = skipHidden ? this.visibleChildren : this.children;

    return children != null && children.length ? children[children.length - 1] : null;
  }

  findNextNode(goInside = true, skipHidden = false) {
    return goInside && this.isExpanded && this.getFirstChild(skipHidden) ||
           this.findNextSibling(skipHidden) ||
           this.parent && this.parent.findNextNode(false, skipHidden);
  }

  findPreviousNode(skipHidden = false) {
    let previousSibling = this.findPreviousSibling(skipHidden);
    if (!previousSibling) {
      return this.realParent;
    }
    return previousSibling._getLastOpenDescendant(skipHidden);
  }

  _getLastOpenDescendant(skipHidden = false) {
    const lastChild = this.getLastChild(skipHidden);
    return (this.isCollapsed || !lastChild)
      ? this
      : lastChild._getLastOpenDescendant(skipHidden);
  }

  private _getParentsChildren(skipHidden = false): any[] {
    const children = this.parent &&
      (skipHidden ? this.parent.getVisibleChildren() : this.parent.children);

    return children || [];
  }

  private getIndexInParent(skipHidden = false) {
    return this._getParentsChildren(skipHidden).indexOf(this);
  }

  isDescendantOf(node: TreeNode) {
    if (this === node) return true;
    else return this.parent && this.parent.isDescendantOf(node);
  }

  getNodePadding(): string {
    return this.options.levelPadding * (this.level - 1) + 'px';
  }

  getClass(): string {
    return [this.options.nodeClass(this), `tree-node-level-${ this.level }`].join(' ');
  }

  onDrop($event) {
    this.mouseAction('drop', $event.event, {
      from: $event.element,
      to: { parent: this, index: 0, dropOnNode: true }
    });
  }

  allowDrop = (element, $event?) => {
    return this.options.allowDrop(element, { parent: this, index: 0 }, $event);
  }

  allowDragoverStyling = () => {
    return this.options.allowDragoverStyling;
  }

  allowDrag() {
    return this.options.allowDrag(this);
  }


  // helper methods:
  loadNodeChildren() {
    if (!this.options.getChildren) {
      return Promise.resolve(); // Not getChildren method - for using redux
    }
    return Promise.resolve(this.options.getChildren(this))
      .then((children) => {
        if (children) {
          this.setField('children', children);
          this._initChildren();
          if (this.options.useTriState && this.treeModel.isSelected(this)) {
            this.setIsSelected(true);
          }
          this.children.forEach((child) => {
            if (child.getField('isExpanded') && child.hasChildren) {
              child.expand();
            }
          });
      }}).then(() => {
        this.fireEvent({
          eventName: TREE_EVENTS.loadNodeChildren,
          node: this
        });
      });
  }

  expand() {
    if (!this.isExpanded) {
      this.toggleExpanded();
    }

    return this;
  }

  collapse() {
    if (this.isExpanded) {
      this.toggleExpanded();
    }

    return this;
  }

  doForAll(fn: (node: ITreeNode) => any) {
    Promise.resolve(fn(this)).then(() => {
      if (this.children) {
        this.children.forEach((child) => child.doForAll(fn));
      }
    });
  }

  expandAll() {
    this.doForAll((node) => node.expand());
  }

  collapseAll() {
    this.doForAll((node) => node.collapse());
  }

  ensureVisible() {
    if (this.realParent) {
      this.realParent.expand();
      this.realParent.ensureVisible();
    }

    return this;
  }

  toggleExpanded() {
    this.setIsExpanded(!this.isExpanded);

    return this;
  }

  setIsExpanded(value) {
    if (this.hasChildren) {
      this.treeModel.setExpandedNode(this, value);
      
      // Load children when expanding if they haven't been loaded yet
      if (value && !this.children && this.hasChildren && !this._isLoadingChildren) {
        this._isLoadingChildren = true;
        this.loadNodeChildren().finally(() => {
          this._isLoadingChildren = false;
        });
      }
    }

    return this;
  };

  autoLoadChildren() {
    // Instead of using effect, we'll load children when the node is expanded
    // This is handled by the toggleExpanded and setIsExpanded methods
    // Check immediately if we should load
    if (this.isExpanded && !this.children && this.hasChildren) {
      this.loadNodeChildren();
    }
  }

  dispose() {
    if (this.children) {
      this.children.forEach((child) => child.dispose());
    }
    this.parent = null;
    this.children = null;
  }

  setIsActive(value, multi = false) {
    this.treeModel.setActiveNode(this, value, multi);
    if (value) {
      this.focus(this.options.scrollOnActivate);
    }

    return this;
  }

  isSelectable() {
    return this.isLeaf || !this.children || !this.options.useTriState;
  }

  setIsSelected(value) {
    if (this.isSelectable()) {
      this.treeModel.setSelectedNode(this, value);
    } else {
      this.visibleChildren.forEach((child) => child.setIsSelected(value));
    }

    return this;
  }

  toggleSelected() {
    this.setIsSelected(!this.isSelected);

    return this;
  }

  toggleActivated(multi = false) {
    this.setIsActive(!this.isActive, multi);

    return this;
  }

  setActiveAndVisible(multi = false) {
    this.setIsActive(true, multi)
      .ensureVisible();

    setTimeout(this.scrollIntoView.bind(this));

    return this;
  }

  scrollIntoView(force = false) {
    this.treeModel.virtualScroll.scrollIntoView(this, force);
  }

  focus(scroll = true) {
    let previousNode = this.treeModel.getFocusedNode();
    this.treeModel.setFocusedNode(this);
    if (scroll) {
      this.scrollIntoView();
    }
    if (previousNode) {
      this.fireEvent({ eventName: TREE_EVENTS.blur, node: previousNode });
    }
    this.fireEvent({ eventName: TREE_EVENTS.focus, node: this });

    return this;
  }

  blur() {
    let previousNode = this.treeModel.getFocusedNode();
    this.treeModel.setFocusedNode(null);
    if (previousNode) {
      this.fireEvent({ eventName: TREE_EVENTS.blur, node: this });
    }

    return this;
  }

  setIsHidden(value) {
    this.treeModel.setIsHidden(this, value);
  }

  hide() {
    this.setIsHidden(true);
  }

  show() {
    this.setIsHidden(false);
  }

  mouseAction(actionName: string, $event, data: any = null) {
    this.treeModel.setFocus(true);

    const actionMapping = this.options.actionMapping.mouse;
    const mouseAction = actionMapping[actionName];

    if (mouseAction) {
      mouseAction(this.treeModel, this, $event, data);
    }
  }

  getSelfHeight() {
    return this.options.nodeHeight(this);
  }

  _initChildren() {
    this.children = this.getField('children')
      .map((c, index) => new TreeNode(c, this, this.treeModel, index));
  }
}

function uuid() {
  return Math.floor(Math.random() * 10000000000000);
}
