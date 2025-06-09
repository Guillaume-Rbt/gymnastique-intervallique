

type Listener = (...args: any[]) => void;

export default class Emitter {
    private listeners: { [event: string]: Listener[] };

    constructor() {
        this.listeners = {};
        this.addListener = this.addListener.bind(this);
        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.removeListener = this.removeListener.bind(this);
        this.off = this.off.bind(this);
        this.once = this.once.bind(this);
        this.listernerCount = this.listernerCount.bind(this);
        this.rawListeners = this.rawListeners.bind(this);
    }

    addListener(event: string, fn: Listener): this {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(fn);
        return this;
    }

    on(event: string, fn: Listener): this {
        return this.addListener(event, fn);
    }

    emit(event: string, data?: Record<string, any>): this {
        const lis = this.listeners[event] || [];

        lis.forEach((fn: Listener) => {
            fn({ eventName: event, ...data });
        });

        return this;
    }

    removeListener(event: string, fn: Listener): this {
        let lis = this.listeners[event] || [];

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
        this.listeners[event] = this.listeners[event] || [];

        const onceWrapper = (data?: Record<string, any>) => {
            fn(data);
            this.off(event, onceWrapper);
        };

        this.listeners[event].push(onceWrapper);

        return this;
    }

    listernerCount(event: string): number {
        let fns = this.listeners[event] || [];
        return fns.length;
    }

    rawListeners(event: string): Listener[] {
        return this.listeners[event] || [];
    }
}
