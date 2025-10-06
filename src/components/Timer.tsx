import { useCallback, useEffect, useRef, useState } from "react";
import useBoolean from "../hooks/useBoolean";
import { useGameContext } from "../hooks/useGameContext";
import { GAME_STATES } from "../libs/game";
import { useGameEffect } from "../hooks/useGameEffect";

const Timer = () => {
    const [points, setPoints] = useState(5);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [running, setRunningTrue, setRunningFalse] = useBoolean(false);
    const [paused, setPausedTrue, setPausedFalse] = useBoolean(false);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0);
    const totalPausedDurationRef = useRef<number>(0);

    const { game } = useGameContext();

    const DURATION = 6;

    const reset = useCallback(() => {
        clearInterval(intervalRef.current!);
        setElapsedSeconds(0);
        setPoints(5);
        game.questionScore = 5;
        totalPausedDurationRef.current = 0;
        pausedAtRef.current = 0;
        startTimeRef.current = 0;
    }, []);

    useEffect(() => {
        if (!running || paused) return;

        if (pausedAtRef.current !== 0) {
            totalPausedDurationRef.current += Date.now() - pausedAtRef.current;
            pausedAtRef.current = 0;
        }

        if (!startTimeRef.current) startTimeRef.current = Date.now();

        intervalRef.current = window.setInterval(() => {
            const now = Date.now();
            const elapsed = Math.min(
                DURATION,
                Math.floor((now - startTimeRef.current - totalPausedDurationRef.current) / 1000),
            );

            setElapsedSeconds(elapsed);

            let newScore = 5;
            if (elapsed >= 6) {
                newScore = 1;
            } else if (elapsed >= 3) {
                newScore = 3;
            }

            setPoints(newScore);
            game.questionScore = newScore;

            if (elapsed >= DURATION) {
                clearInterval(intervalRef.current!);
            }
        }, 1000);

        return () => clearInterval(intervalRef.current!);
    }, [running, paused]);

    const pause = useCallback(() => {
        if (!running || !paused) return;
        pausedAtRef.current = Date.now();
        clearInterval(intervalRef.current!);
    }, [paused]);

    useGameEffect({
        onEnter: {
            [GAME_STATES.WAIT_ANSWER]: () => {
                setRunningTrue();
                setPausedFalse();
            },

            [GAME_STATES.ANSWERED]: () => {
                setPausedTrue();
                pause();
            },

            [GAME_STATES.INTERVAL_PLAYED]: () => {
                setPausedFalse();
                setRunningFalse();
                reset();
            },
        },
    });

    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = (circumference / DURATION) * elapsedSeconds;

    return (
        <div className='flex h-[4em] min-w-[48px] aspect-ratio-square  w-[4em] text-3 rounded-full flex-justify-center flex-items-center position-relative'>
            <span className='text-3'>{points} pts</span>
            <svg className='absolute color-blue w-full h-full ' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                <circle
                    className='opacity-35'
                    cx='12'
                    cy='12'
                    r={radius}
                    stroke='currentColor'
                    fill='none'
                    strokeWidth='2'
                />
                <circle
                    cx='12'
                    cy='12'
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    stroke='currentColor'
                    fill='none'
                    strokeWidth='2'
                    className='transform-origin-c rotate-270 scale-y--100'
                    style={{ transition: "stroke-dashoffset 0.25s ease" }}
                />
            </svg>
        </div>
    );
};

export default Timer;
