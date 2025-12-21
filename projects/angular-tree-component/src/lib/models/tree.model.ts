import { Injectable, OnDestroy, signal, effect } from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeNode } from './tree-node.model';
import { TreeOptions } from './tree-options.model';
import { TreeVirtualScroll } from './tree-virtual-scroll.model';
import { ITreeModel, IDType, IDTypeDictionary } from '../defs/api';
import { TREE_EVENTS } from '../constants/events';

@Injectable()
export class TreeModel implements ITreeModel, OnDestroy {
  static focusedTree = null;

  options: TreeOptions = new TreeOptions();
  nodes: any[];
  eventNames = Object.keys(TREE_EVENTS);
  virtualScroll: TreeVirtualScroll;

  // Private signals
  private _roots = signal<TreeNode[]>(undefined);
  private _expandedNodeIds = signal<IDTypeDictionary>({});
  private _selectedLeafNodeIds = signal<IDTypeDictionary>({});
  private _activeNodeIds = signal<IDTypeDictionary>({});
  private _hiddenNodeIds = signal<IDTypeDictionary>({});
  private _hiddenNodes = signal<TreeNode[]>([]);
  private _focusedNodeId = signal<IDType>(null);
  private _virtualRoot = signal<TreeNode>(undefined);

  // Public getters/setters to maintain API compatibility
  get roots(): TreeNode[] { return this._roots(); }
  private set roots(value: TreeNode[]) { this._roots.set(value); }

  get virtualRoot(): TreeNode { return this._virtualRoot(); }

  get focusedNode(): TreeNode {
    const id = this._focusedNodeId();
    return id ? this.getNodeById(id) : null;
  }

  get expandedNodes(): TreeNode[] {
    const ids = this._expandedNodeIds();
    const nodes = Object.keys(ids)
      .filter((id) => ids[id])
      .map((id) => this.getNodeById(id));
    return nodes.filter(Boolean);
  }

  get activeNodes(): TreeNode[] {
    const ids = this._activeNodeIds();
    const nodes = Object.keys(ids)
      .filter((id) => ids[id])
      .map((id) => this.getNodeById(id));
    return nodes.filter(Boolean);
  }

  get hiddenNodes(): TreeNode[] {
    return this._hiddenNodes();
  }

  get selectedLeafNodes(): TreeNode[] {
    const ids = this._selectedLeafNodeIds();
    const nodes = Object.keys(ids)
        .filter((id) => ids[id])
        .map((id) => this.getNodeById(id));
    return nodes.filter(Boolean);
  }

  private firstUpdate = true;
  private events: any;
  private subscriptions: Subscription[] = [];

  // events
  fireEvent(event) {
    event.treeModel = this;
    this.events[event.eventName].emit(event);
    this.events.event.emit(event);
  }

  subscribe(eventName, fn) {
    const subscription = this.events[eventName].subscribe(fn);
    this.subscriptions.push(subscription);
  }


  // getters
  getFocusedNode(): TreeNode {
    return this.focusedNode;
  }

  getActiveNode(): TreeNode {
    return this.activeNodes[0];
  }

  getActiveNodes(): TreeNode[] {
    return this.activeNodes;
  }

  getVisibleRoots() {
    return this._virtualRoot()?.visibleChildren;
  }

  getFirstRoot(skipHidden = false) {
    const root = skipHidden ? this.getVisibleRoots() : this.roots;
    return root != null && root.length ? root[0] : null;
  }

  getLastRoot(skipHidden = false) {
    const root = skipHidden ? this.getVisibleRoots() : this.roots;
    return root != null && root.length ? root[root.length - 1] : null;
  }

  get isFocused() {
    return TreeModel.focusedTree === this;
  }

  isNodeFocused(node) {
    return this.focusedNode === node;
  }

  isEmptyTree(): boolean {
    const rootNodes = this.roots;
    return rootNodes && rootNodes.length === 0;
  }

  // locating nodes
  getNodeByPath(path: any[], startNode= null): TreeNode {
    if (!path) return null;

    startNode = startNode || this._virtualRoot();
    if (path.length === 0) return startNode;

    if (!startNode.children) return null;

    const childId = path.shift();
    const childNode = startNode.children.find(c => c.id === childId);

    if (!childNode) return null;

    return this.getNodeByPath(path, childNode);
  }

  getNodeById(id) {
    const idStr = id.toString();

    return this.getNodeBy((node) => node.id.toString() === idStr);
  }

  getNodeBy(predicate, startNode = null) {
    startNode = startNode || this._virtualRoot();

    if (!startNode.children) return null;

    const found = startNode.children.find(predicate);

    if (found) { // found in children
      return found;
    } else { // look in children's children
      for (let child of startNode.children) {
        const foundInChildren = this.getNodeBy(predicate, child);
        if (foundInChildren) return foundInChildren;
      }
    }
  }

  isExpanded(node) {
    return this._expandedNodeIds()[node.id];
  }

  isHidden(node) {
    return this._hiddenNodeIds()[node.id];
  }

  isActive(node) {
    return this._activeNodeIds()[node.id];
  }

  isSelected(node) {
    return this._selectedLeafNodeIds()[node.id];
  }

  ngOnDestroy() {
    this.dispose();
    this.unsubscribeAll();
  }

  dispose() {
    // Dispose reactions of the replaced nodes
    const vRoot = this._virtualRoot();
    if (vRoot) {
      vRoot.dispose();
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  // actions
  setData({ nodes, options = null, events = null }: {nodes: any, options: any, events: any}) {
    if (options) {
      this.options = new TreeOptions(options);
    }
    if (events) {
      this.events = events;
    }
    if (nodes) {
      this.nodes = nodes;
    }

    this.update();
  }

  update() {
    // Rebuild tree:
    let virtualRootConfig = {
      id: this.options.rootId,
      virtual: true,
      [this.options.childrenField]: this.nodes
    };

    this.dispose();

    const newVirtualRoot = new TreeNode(virtualRootConfig, null, this, 0);
    this._virtualRoot.set(newVirtualRoot);
    this.roots = newVirtualRoot.children;

    // Fire event:
    const currentRoots = this.roots;
    if (this.firstUpdate) {
      if (currentRoots) {
        this.firstUpdate = false;
        this._calculateExpandedNodes();
      }
    } else {
      this.fireEvent({ eventName: TREE_EVENTS.updateData });
    }
  }


  setFocusedNode(node) {
    this._focusedNodeId.set(node ? node.id : null);
  }

  setFocus(value) {
    TreeModel.focusedTree = value ? this : null;
  }

  doForAll(fn) {
    this.roots.forEach((root) => root.doForAll(fn));
  }

  focusNextNode() {
    let previousNode = this.getFocusedNode();
    let nextNode = previousNode ? previousNode.findNextNode(true, true) : this.getFirstRoot(true);
    if (nextNode) nextNode.focus();
  }

  focusPreviousNode() {
    let previousNode = this.getFocusedNode();
    let nextNode = previousNode ? previousNode.findPreviousNode(true) : this.getLastRoot(true);
    if (nextNode) nextNode.focus();
  }

  focusDrillDown() {
    let previousNode = this.getFocusedNode();
    if (previousNode && previousNode.isCollapsed && previousNode.hasChildren) {
      previousNode.toggleExpanded();
    }
    else {
      let nextNode = previousNode ? previousNode.getFirstChild(true) : this.getFirstRoot(true);
      if (nextNode) nextNode.focus();
    }
  }

  focusDrillUp() {
    let previousNode = this.getFocusedNode();
    if (!previousNode) return;
    if (previousNode.isExpanded) {
      previousNode.toggleExpanded();
    }
    else {
      let nextNode = previousNode.realParent;
      if (nextNode) nextNode.focus();
    }
  }

  setActiveNode(node, value, multi = false) {
    if (multi) {
      this._setActiveNodeMulti(node, value);
    }
    else {
      this._setActiveNodeSingle(node, value);
    }

    if (value) {
      node.focus(this.options.scrollOnActivate);
      this.fireEvent({ eventName: TREE_EVENTS.activate, node });
      this.fireEvent({ eventName: TREE_EVENTS.nodeActivate, node }); // For IE11
    } else {
      this.fireEvent({ eventName: TREE_EVENTS.deactivate, node });
      this.fireEvent({ eventName: TREE_EVENTS.nodeDeactivate, node }); // For IE11
    }
  }

  setSelectedNode(node, value) {
    this._selectedLeafNodeIds.update(ids => ({...ids, [node.id]: value}));

    if (value) {
      node.focus();
      this.fireEvent({ eventName: TREE_EVENTS.select, node });
    } else {
      this.fireEvent({ eventName: TREE_EVENTS.deselect, node });
    }
  }

  setExpandedNode(node, value) {
    this._expandedNodeIds.update(ids => ({...ids, [node.id]: value}));
    this.fireEvent({ eventName: TREE_EVENTS.toggleExpanded, node, isExpanded: value });
  }

  expandAll() {
    this.roots.forEach((root) => root.expandAll());
  }

  collapseAll() {
    this.roots.forEach((root) => root.collapseAll());
  }

  setIsHidden(node, value) {
    this._hiddenNodeIds.update(ids => ({...ids, [node.id]: value}));
  }

  setHiddenNodeIds(nodeIds) {
    const ids = nodeIds.reduce((hiddenNodeIds, id) => ({
      ...hiddenNodeIds,
      [id]: true
    }), {});
    this._hiddenNodeIds.set(ids);
  }

  performKeyAction(node, $event) {
    const keyAction = this.options.actionMapping.keys[$event.keyCode];
    if (keyAction) {
      $event.preventDefault();
      keyAction(this, node, $event);
      return true;
    } else {
      return false;
    }
  }

  filterNodes(filter, autoShow = true) {
    let filterFn;

    if (!filter) {
      return this.clearFilter();
    }

    // support function and string filter
    if (filter && typeof filter.valueOf() === 'string') {
      filterFn = (node) => node.displayField.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    }
    else if (filter && typeof filter === 'function') {
       filterFn = filter;
    }
    else {
      console.error('Don\'t know what to do with filter', filter);
      console.error('Should be either a string or function');
      return;
    }

    const ids = {};
    var hiddenNodes=[];
    this.roots.forEach((node) => this._filterNode(ids, node, filterFn, autoShow,hiddenNodes));
    this._hiddenNodeIds.set(ids);
    this._hiddenNodes.set(hiddenNodes);

    this.fireEvent({ eventName: TREE_EVENTS.changeFilter });
  }

  clearFilter() {
    this._hiddenNodeIds.set({});
    this._hiddenNodes.set([]);

    this.fireEvent({ eventName: TREE_EVENTS.changeFilter });
  }

  moveNode(node, to) {
    const fromIndex = node.getIndexInParent();
    const fromParent = node.parent;

    if (!this.canMoveNode(node, to, fromIndex)) return;

    const fromChildren = fromParent.getField('children');

    // If node doesn't have children - create children array
    if (!to.parent.getField('children')) {
      to.parent.setField('children', []);
    }
    const toChildren = to.parent.getField('children');

    const originalNode = fromChildren.splice(fromIndex, 1)[0];

    // Compensate for index if already removed from parent:
    let toIndex = (fromParent === to.parent && to.index > fromIndex) ? to.index - 1 : to.index;

    toChildren.splice(toIndex, 0, originalNode);

    fromParent.treeModel.update();
    if (to.parent.treeModel !== fromParent.treeModel) {
      to.parent.treeModel.update();
    }

    this.fireEvent({
      eventName: TREE_EVENTS.moveNode,
      node: originalNode,
      to: { parent: to.parent.data, index: toIndex },
      from: { parent: fromParent.data, index: fromIndex}
    });
  }

  copyNode(node, to) {
    const fromIndex = node.getIndexInParent();

    if (!this.canMoveNode(node, to, fromIndex)) return;

    // If node doesn't have children - create children array
    if (!to.parent.getField('children')) {
      to.parent.setField('children', []);
    }
    const toChildren = to.parent.getField('children');

    const nodeCopy = this.options.getNodeClone(node);

    toChildren.splice(to.index, 0, nodeCopy);

    node.treeModel.update();
    if (to.parent.treeModel !== node.treeModel) {
      to.parent.treeModel.update();
    }

    this.fireEvent({ eventName: TREE_EVENTS.copyNode, node: nodeCopy, to: { parent: to.parent.data, index: to.index } });
  }

  getState() {
    return {
      expandedNodeIds: this._expandedNodeIds(),
      selectedLeafNodeIds: this._selectedLeafNodeIds(),
      activeNodeIds: this._activeNodeIds(),
      hiddenNodeIds: this._hiddenNodeIds(),
      focusedNodeId: this._focusedNodeId()
    };
  }

  setState(state) {
    if (!state) return;

    this._expandedNodeIds.set(state.expandedNodeIds || {});
    this._selectedLeafNodeIds.set(state.selectedLeafNodeIds || {});
    this._activeNodeIds.set(state.activeNodeIds || {});
    this._hiddenNodeIds.set(state.hiddenNodeIds || {});
    this._focusedNodeId.set(state.focusedNodeId);
  }

  subscribeToState(fn) {
    effect(() => fn(this.getState()));
  }

  canMoveNode(node, to, fromIndex = undefined) {
    const fromNodeIndex = fromIndex || node.getIndexInParent();

    // same node:
    if (node.parent === to.parent && fromIndex === to.index) {
      return false;
    }

    return !to.parent.isDescendantOf(node);
  }

  calculateExpandedNodes() {
      this._calculateExpandedNodes();
  }

  // private methods
  private _filterNode(ids, node, filterFn, autoShow,hiddenNodes) {
    // if node passes function then it's visible
    let isVisible = filterFn(node);

    if (node.children) {
      // if one of node's children passes filter then this node is also visible
      node.children.forEach((child) => {
        if (this._filterNode(ids, child, filterFn, autoShow, hiddenNodes)) {
          isVisible = true;
        }
      });
    }

    // mark node as hidden
    if (!isVisible) {
      ids[node.id] = true;
      hiddenNodes.push(node);
    }
    // auto expand parents to make sure the filtered nodes are visible
    if (autoShow && isVisible) {
      node.ensureVisible();
    }
    return isVisible;
  }

  private _calculateExpandedNodes(startNode = null) {
    startNode = startNode || this._virtualRoot();

    if (startNode.data[this.options.isExpandedField]) {
      this._expandedNodeIds.update(ids => ({...ids, [startNode.id]: true}));
    }
    if (startNode.children) {
      startNode.children.forEach((child) => this._calculateExpandedNodes(child));
    }
  }

  private _setActiveNodeSingle(node, value) {
    // Deactivate all other nodes:
    this.activeNodes
      .filter((activeNode) => activeNode !== node)
      .forEach((activeNode) => {
        this.fireEvent({ eventName: TREE_EVENTS.deactivate, node: activeNode });
        this.fireEvent({ eventName: TREE_EVENTS.nodeDeactivate, node: activeNode }); // For IE11
      });

    if (value) {
      this._activeNodeIds.set({[node.id]: true});
    }
    else {
      this._activeNodeIds.set({});
    }
  }

  private _setActiveNodeMulti(node, value) {
    this._activeNodeIds.update(ids => ({...ids, [node.id]: value}));
  }

  generatedIds:any={};
  uuid() {
    var res = Math.floor(Math.random() * 10000000000000);
    while(this.generatedIds[res]){
      res = Math.floor(Math.random() * 10000000000000);
    }
    this.generatedIds[res]=true;
    return res;
  }

}
