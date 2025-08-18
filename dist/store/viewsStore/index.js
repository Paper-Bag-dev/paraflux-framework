"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewStore = void 0;
class ViewStore {
    viewMap = {};
    viewKeys = [];
    addView(key, view) {
        if (!this.viewMap[key]) {
            this.viewMap[key] = view;
            this.viewKeys.push(key);
        }
    }
    getView(key) {
        return this.viewMap[key];
    }
    getAllViews() {
        return this.viewKeys.map(key => this.viewMap[key]);
    }
    updateView(key, value) {
        if (!this.viewMap[key]) {
            return false;
        }
        this.viewMap[key] = value;
        return true;
    }
    removeView(key) {
        delete this.viewMap[key];
        this.viewKeys = this.viewKeys.filter(k => k !== key);
    }
}
exports.ViewStore = ViewStore;
