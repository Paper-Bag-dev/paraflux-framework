import { Node } from "@paraflux/core";

type StoredView = {
  packageName: string;
  value: Node;
};


export class ViewStore{
  viewMap: Record<string, StoredView> = {};
  viewKeys: string[] = [];

  addView(key: string, view: StoredView){
    if(!this.viewMap[key]){
      this.viewMap[key] = view;
      this.viewKeys.push(key);
    }
  }

  getView(key: string): StoredView | undefined {
    return this.viewMap[key];
  }

  getAllViews(): StoredView[] {
    return this.viewKeys.map(key => this.viewMap[key]);
  }

  updateView(key:string, value: StoredView): boolean{
    if(!this.viewMap[key]){
      return false;
    }
    this.viewMap[key] = value;
    return true;
  }

  removeView(key: string) {
    delete this.viewMap[key];
    this.viewKeys = this.viewKeys.filter(k => k !== key);
  }
}