import { useEffect, useRef } from "react";
import Game, { GAME_STATES } from "../libs/game";

const game = new Game();

type Callback = (data: { state: GAME_STATES } & { [key: string]: any }) => void | Promise<void>;

type EffectMap = Partial<
    Record<
        GAME_STATES,
        Callback | { fn: Callback; once?: boolean } | Array<Callback | { fn: Callback; once?: boolean }>
    >
>;

interface UseGameEffectOptions {
    onEnter?: EffectMap;
    onExit?: EffectMap;
    runEnterIfAlreadyInState?: boolean;
}

/**
 * Custom hook to handle game state effects
 * This hook allows components to register callbacks that will be executed
 * when the game enters specific states
 *
 * @param options - Configuration object containing callback functions for different game states
 * @param options.onEnter - Object mapping game states to callback functions that execute when entering those states
 *
 * @example
 * useGameEffect({
 *   onEnter: {
 *     [GAME_STATES.STARTED]: () => {
 *       console.log('Game started');
 *     },
 *     [GAME_STATES.ENDED]: () => {
 *       console.log('Game ended');
 *     }
 *   }
 * });
 */
export function useGameEffect({ onEnter, onExit, runEnterIfAlreadyInState = false }: UseGameEffectOptions) {
    const enterRef = useRef(onEnter);
    const exitRef = useRef(onExit);
    enterRef.current = onEnter;
    exitRef.current = onExit;

    const prevStateRef = useRef<GAME_STATES>(game.state);

    function getCallbacks(map: EffectMap | undefined, state: GAME_STATES) {
        const raw = map?.[state];
        if (!raw) return [];

        const arr = Array.isArray(raw) ? raw : [raw];
        return arr.map((item) =>
            typeof item === "function" ? { fn: item, once: false } : { fn: item.fn, once: !!item.once },
        );
    }

    useEffect(() => {
        if (runEnterIfAlreadyInState) {
            const enterCallbacks = getCallbacks(enterRef.current, game.state);
            for (const { fn, once } of enterCallbacks) {
                fn({ state: game.state });
                if (once && enterRef.current?.[game.state]) {
                    const raw = enterRef.current[game.state];
                    enterRef.current[game.state] = Array.isArray(raw)
                        ? raw.filter((r) => (typeof r === "function" ? r !== fn : r.fn !== fn))
                        : undefined;
                }
            }
        }

        /**
         * Handler function that gets called when game state changes
         * Checks if there's a callback registered for the new state and executes it
         *
         * @param data - Event data containing the new game state
         */
        const handler = (data: { state: GAME_STATES } & { [key: string]: any }) => {
            const next = data.state;
            const prev = prevStateRef.current;
            if (prev === next) return;
            prevStateRef.current = next;
            const exitCallbacks = getCallbacks(exitRef.current, prev);
            for (const { fn, once } of exitCallbacks) {
                fn({ ...data, prev: prev });
                if (once && exitRef.current?.[prev]) {
                    const raw = exitRef.current[prev];
                    exitRef.current[prev] = Array.isArray(raw)
                        ? raw.filter((r) => (typeof r === "function" ? r !== fn : r.fn !== fn))
                        : undefined;
                }
            }

            const enterCallbacks = getCallbacks(enterRef.current, next);
            for (const { fn, once } of enterCallbacks) {
                fn({ ...data, prev: prev });
                if (once && enterRef.current?.[next]) {
                    const raw = enterRef.current[next];
                    enterRef.current[next] = Array.isArray(raw)
                        ? raw.filter((r) => (typeof r === "function" ? r !== fn : r.fn !== fn))
                        : undefined;
                }
            }
        };

        // Subscribe to game state change events
        // This listener will be called whenever the game state changes
        game.on(Game.EVENTS.STATE_CHANGED, handler);
        // Cleanup function to remove the event listener when component unmounts
        // or when the dependencies change
        return () => {
            game.off(Game.EVENTS.STATE_CHANGED, handler);
        };
    }, [runEnterIfAlreadyInState]);
}
