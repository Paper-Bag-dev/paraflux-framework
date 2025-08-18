"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
exports.default = debounce;
