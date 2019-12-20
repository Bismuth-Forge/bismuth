
class EngineContext implements IDriverContext {
    public get backend(): string {
        return this.drvctx.backend;
    }

    public get currentSurface(): ISurface {
        return this.drvctx.currentSurface;
    }

    public get currentWindow(): Window | null {
        return this.drvctx.currentWindow;
    }

    public get screens(): ISurface[] {
        return this.drvctx.screens;
    }

    public get setTimeout(): (func: () => void, timeout: number) => void {
        return this.drvctx.setTimeout;
    }

    constructor(private drvctx: IDriverContext, private engine: TilingEngine) {
    }

    // TODO: reloated most of this into Engine
    public moveWindow(window: Window, target: Window) {
        this.engine.windows.move(window, target);
    }
}
