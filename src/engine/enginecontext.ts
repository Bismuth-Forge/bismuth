
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

    constructor(private drvctx: IDriverContext, private engine: TilingEngine) {
    }

    public setTimeout(func: () => void, timeout: number): void {
        this.drvctx.setTimeout(func, timeout);
    }

    public moveWindow(window: Window, target: Window, after?: boolean) {
        this.engine.windows.move(window, target, after);
    }
}
