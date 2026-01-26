import type React from "react";
import type Game from "./game";
import type { AnimationManager } from "./animations/anim-manager";
import type { Interval } from "./interval-generator";
import type { Timeline } from "animejs";

export type ButtonVariants = { [key: string]: string | [] };
export type ButtonVariant = keyof ButtonVariants;
export type ButtonProps = {
    label?: string;
    onClick?: () => void;
    classes?: string | string[];
    variant?: ButtonVariant;
    variants?: ButtonVariants;
    children?: any;
    ref?: React.Ref<HTMLButtonElement>;
};
export type DeviceType = "mobile" | "tablet" | "desktop";
export type DeviceSnapshot = {
    type: DeviceType;
    width: number;
    ua: string;
};
export type GameContext = {
    game: Game;
    animManager: AnimationManager;
};
export type GameConfig = { allowedIntervals: AllowedIntervals };
export type AnsweredIntervalType = {
    id: string;
    answer: string;
    correct: boolean;
    expected: string;
    interval: Interval;
};
export type AllowedIntervals = Map<number, { text: string; enabled: boolean }>;
export type intervalGeneratorOptions = {
    allowedIntervals: AllowedIntervals;
};

export type AnimationsOptions = {
    name?: string;
    initOnLaunch?: boolean;
    initializer: () => void;
    executor: () => Timeline;
};

export type scormData = {
    "cmi.score.raw": number;
    "cmi.suspend_data": string;
};
