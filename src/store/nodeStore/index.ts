import { Node } from "@paraflux/core";

type StoredNode = {
  packageName: string;
  nodeKey: string;
  node: Node;
};

export class NodeStore{
  nodeMap: Record<string, StoredNode> = {};
  nodeKeys: string[] = [];

  addView(key: string, view: StoredNode){
    if(!this.nodeMap[key]){
      this.nodeMap[key] = view;
      this.nodeKeys.push(key);
    }
  }

  getView(key: string): StoredNode | undefined {
    return this.nodeMap[key];
  }

  getAllViews(): StoredNode[] {
    return this.nodeKeys.map(key => this.nodeMap[key]);
  }

  updateView(key:string, value: StoredNode): boolean{
    if(!this.nodeMap[key]){
      return false;
    }
    this.nodeMap[key] = value;
    return true;
  }

  removeView(key: string) {
    delete this.nodeMap[key];
    this.nodeKeys = this.nodeKeys.filter(k => k !== key);
  }
}