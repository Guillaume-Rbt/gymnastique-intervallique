import { animate, type Callback, type JSAnimation, type Tickable, type Timeline, type Tween } from "animejs";
import Emitter from "../emitter-mixin";

export type AnimationsOptions = {
    name?: string;
    initializer: () => void;
    executor: () => Timeline;
};

const CALLBACK_NAMES = ["onBegin", "onComplete", "onBeforeUpdate", "onUpdate", "onLoop", "onPause"];

let callbackDefaults: null | Callback<JSAnimation>;

try {
    callbackDefaults = animate([], {}).onUpdate;
} catch {}

export default class Animation extends Emitter {
    initializer: () => void = () => {};
    executor: () => Timeline;
    name: string = "";
    completed: boolean = false;

    instance: Timeline | null = null;

    static get INITIALIZE_START() {
        return "Animation.initialize.start";
    }

    static get INITIALIZE_END() {
        return "Animation.initialize.end";
    }

    static get LAUNCH_START() {
        return "Animation.launch.start";
    }

    static get LAUNCH_END() {
        return "Animation.launc.end";
    }

    static get CANCEL() {
        return "Animation.cancel";
    }

    static get BEGIN() {
        return "Animation.begin";
    }

    static get END() {
        return "Animation.end";
    }

    static get CUSTOM_BEGIN() {
        return "Animation.custom.begin";
    }

    static get CUSTOM_END() {
        return "Animation.custom.end";
    }

    static get UPDATE() {
        return "Animation.update";
    }

    static get CALLBACK() {
        return "Animation.callback";
    }

    constructor(options: AnimationsOptions) {
        super();
        this.initializer = options.initializer || this.initializer;
        this.executor = options.executor;
        this.name = options.name || this.name;
        this.init();
    }

    init() {
        this.initializer();
    }

    registerCallbacks(instance: Timeline | Tickable | Tween) {
        CALLBACK_NAMES.forEach((callbackName) => {
            const callback = (instance as Record<string, any>)[callbackName];

            if (typeof callback === "function" && callback != callbackDefaults) {
                const defaultCallbackRegisterOptions = {
                    name: `${callbackName}-unnamed`,
                    callback: () => {},
                };

                let callbackRegisterOpts;

                try {
                    callbackRegisterOpts = callback(instance);
                } catch {}

                if (
                    !callbackRegisterOpts ||
                    typeof callbackRegisterOpts !== "object" ||
                    !callbackRegisterOpts.callback
                ) {
                    console.warn(`Animation ${callbackName} callback is not registered due invalidity.`);
                    console.warn(`${callbackName} callback still works but not being emitted.`);
                    return;
                }

                const options = {
                    ...defaultCallbackRegisterOptions,
                    ...callbackRegisterOpts,
                };

                (instance as Record<string, any>)[callbackName] = () => {
                    this.emit(Animation.CALLBACK, {
                        target: this,
                        animation: instance,
                        name: `${callbackName}-${options.name}`,
                    });

                    this.completed = true;

                    options.callback(instance);
                };
            }
        });
    }

    launch() {
        if (!this.instance) {
            this.instance = this.executor();
            this.registerCallbacks(this.instance);

            if (this.instance._hasChildren) {
                let next = this.instance._head;

                while (next) {
                    this.registerCallbacks(next);
                    next = next._next;
                }
            }
        }

        console.log(this.instance);

        this.instance!.play();
    }
}
