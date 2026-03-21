export declare function createLazyRuntimeSurface<TModule, TSurface>(importer: () => Promise<TModule>, select: (module: TModule) => TSurface): () => Promise<TSurface>;
export declare function createLazyRuntimeMethod<TSurface, TArgs extends unknown[], TResult>(load: () => Promise<TSurface>, select: (surface: TSurface) => (...args: TArgs) => TResult): (...args: TArgs) => Promise<Awaited<TResult>>;
