"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeStore = void 0;
class NodeStore {
    nodeMap = {};
    nodeKeys = [];
    addView(key, view) {
        if (!this.nodeMap[key]) {
            this.nodeMap[key] = view;
            this.nodeKeys.push(key);
        }
    }
    getView(key) {
        return this.nodeMap[key];
    }
    getAllViews() {
        return this.nodeKeys.map(key => this.nodeMap[key]);
    }
    updateView(key, value) {
        if (!this.nodeMap[key]) {
            return false;
        }
        this.nodeMap[key] = value;
        return true;
    }
    removeView(key) {
        delete this.nodeMap[key];
        this.nodeKeys = this.nodeKeys.filter(k => k !== key);
    }
}
exports.NodeStore = NodeStore;
