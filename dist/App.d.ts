import { Node } from "@paraflux/core";
declare class App extends Node {
    code(): {
        test: string;
    };
    render(): (Node | import("@paraflux/core").SuperNode)[];
}
export default App;
