/** Dispose in reverse construction order, including partially mounted worlds. */
export function createDisposalScope() {
    const callbacks: (() => void)[] = [];
    let disposed = false;
    return {
        defer: (callback: () => void) => {
            if (disposed)
                throw new Error("Resource scope already disposed");
            callbacks.push(callback);
        },
        dispose: () => {
            if (disposed)
                return;
            disposed = true;
            const errors: unknown[] = [];
            for (const callback of callbacks.reverse())
                try {
                    callback();
                }
                catch (error) {
                    errors.push(error);
                }
            callbacks.length = 0;
            if (errors.length)
                throw new AggregateError(errors, "World cleanup failed");
        },
    };
}
