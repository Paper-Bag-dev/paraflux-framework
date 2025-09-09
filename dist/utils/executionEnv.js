"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@paraflux/core");
process.on('message', async (root) => {
    try {
        await (0, core_1.execTreeNaive)(root);
    }
    catch (e) {
        console.error("Tree execution error:", e);
        process.exit(1);
    }
});
