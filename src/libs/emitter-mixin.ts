type Listener = (...args: any[]) => void;

export default class Emitter {
    private listeners: Record<string, Listener[]> = {};

    addListener(event: string, fn: Listener): this {
        (this.listeners[event] ||= []).push(fn);
        return this;
    }
    on(event: string, fn: Listener): this {
        return this.addListener(event, fn);
    }

    emit(event: string, data?: Record<string, any>): this {
        const fns = this.listeners[event]?.slice() ?? [];
        for (const fn of fns) fn({ eventName: event, ...(data ?? {}) });
        return this;
    }

    removeListener(event: string, fn: Listener): this {
        const lis = this.listeners[event];
        if (!lis) return this;
        for (let i = lis.length - 1; i >= 0; i--) {
            if (lis[i] === fn) {
                lis.splice(i, 1);
                break;
            }
        }
        return this;
    }
    off(event: string, fn: Listener): this {
        return this.removeListener(event, fn);
    }

    once(event: string, fn: Listener): this {
        const onceWrapper: Listener = (data?: Record<string, any>) => {
            try {
                fn(data);
            } finally {
                this.off(event, onceWrapper);
            }
        };
        return this.addListener(event, onceWrapper);
    }

    listenerCount(event: string): number {
        return this.listeners[event]?.length ?? 0;
    }

    rawListeners(event: string): Listener[] {
        return this.listeners[event]?.slice() ?? [];
    }
}
