import Emitter from "../emitter-mixin";
import Animation from "./animations";
import type { AnimationsOptions } from "../types";

export class AnimationManager extends Emitter {
    static get ANIMATION_BEGIN() {
        return "AnimationManager.animation.begin";
    }

    static get ANIMATION_CUSTOM_BEGIN() {
        return "AnimationManager.animation.custom.begin";
    }
    static get ANIMATION_END() {
        return "AnimationManager.animation.end";
    }

    static get ANIMATION_CUSTOM_END() {
        return "AnimationManager.animation.custom.end";
    }

    static get ANIMATION_UPDATE() {
        return "AnimationManager.animation.update";
    }

    static get ANIMATION_CALLBACK() {
        return "AnimationManager.animation.callback";
    }

    static get ANIMATION_INITIALIZE_START() {
        return "AnimationManager.animation.initialize.start";
    }

    static get ANIMATION_INITIALIZE_END() {
        return "AnimationManager.animation.initialize.end";
    }

    static get ANIMATION_LAUNCH_START() {
        return "AnimationManager.animation.launch.start";
    }

    static get ANIMATION_LAUNCH_END() {
        return "AnimationManager.animation.launch.end";
    }

    static get ANIMATION_CANCEL() {
        return "AnimationManager.animation.cancel";
    }

    animations: Map<string, Animation> = new Map();

    constructor() {
        super();
    }

    register(
        options: {
            name: string;
        } & AnimationsOptions,
    ) {
        const animation = new Animation({
            name: options.name,
            initOnLaunch: options.initOnLaunch || false,
            initializer: options.initializer,
            executor: options.executor,
        });

        const exist = this.animations.has(options.name);

        if (!exist) {
            this.animations.set(options.name, animation);

            animation.on(Animation.BEGIN, (event) => {
                this.emit(AnimationManager.ANIMATION_BEGIN, {
                    animation: event.target,
                    trackingData: event.data,
                });
            });

            animation.on(Animation.CUSTOM_BEGIN, (event) => {
                this.emit(AnimationManager.ANIMATION_CUSTOM_BEGIN, {
                    animation: event.target,
                    trackingData: event.data,
                });
            });

            animation.on(Animation.END, (event) => {
                this.emit(AnimationManager.ANIMATION_END, {
                    animation: event.target,
                    trackingData: event.data,
                });
            });

            animation.on(Animation.CUSTOM_END, (event) => {
                this.emit(AnimationManager.ANIMATION_CUSTOM_END, {
                    animation: event.target,
                    trackingData: event.data,
                });
            });

            animation.on(Animation.UPDATE, (event) => {
                this.emit(AnimationManager.ANIMATION_UPDATE, {
                    animation: event.target,
                    trackingData: event.data,
                });
            });

            animation.on(Animation.CALLBACK, (event) => {
                const targetAnimation = event.target;
                this.emit(AnimationManager.ANIMATION_CALLBACK, {
                    animation: targetAnimation,
                    callbackData: {
                        ...event.data,
                        name: `${targetAnimation.name}-${event.name}`,
                    },
                });
            });

            animation.on(Animation.INITIALIZE_START, (event) => {
                this.emit(AnimationManager.ANIMATION_INITIALIZE_START, {
                    animation: event.target,
                });
            });

            animation.on(Animation.INITIALIZE_END, (event) => {
                this.emit(AnimationManager.ANIMATION_INITIALIZE_END, {
                    animation: event.target,
                });
            });

            animation.on(Animation.LAUNCH_START, (event) => {
                this.emit(AnimationManager.ANIMATION_LAUNCH_START, {
                    animation: event.target,
                });
            });

            animation.on(Animation.LAUNCH_END, (event) => {
                this.emit(AnimationManager.ANIMATION_LAUNCH_END, {
                    animation: event.target,
                });
            });

            animation.on(Animation.CANCEL, (event) => {
                this.emit(AnimationManager.ANIMATION_CANCEL, {
                    animation: event.target,
                });
            });

            return true;
        }

        return false;
    }

    unregister(name: string) {
        return this.animations.delete(name);
    }

    getAnimationById(name: string) {
        return this.animations.get(name);
    }

    launch(name: string) {
        const anim = this.getAnimationById(name);
        if (anim) {
            return anim.launch();
        }
    }
}
