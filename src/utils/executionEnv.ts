import { execTreeNaive, SuperNode, Node } from '@paraflux/core';

process.on('message', async (root: SuperNode | Node) => {
  try {
    await execTreeNaive(root);
  } catch (e) {
    console.error("Tree execution error:", e);
    process.exit(1);
  }
});
