declare class LiveNOM {
    private root;
    private App;
    constructor();
    private loadApp;
    updateRoot(buildPath: string): Promise<void>;
}
export default LiveNOM;
