import { createScope, Scope } from "animejs";
import { useGameContext } from "../hooks/useGameContext";
import { useGameState } from "../hooks/useGameState";
import { useEffect, useLayoutEffect, useRef } from "react";

export function Header() {
    const { animManager } = useGameContext();

    const state = useGameState();

    const scope = useRef<Scope | null>(null);
    const root = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {}, []);

    return (
        <header
            ref={root}
            className='bg-slate-100 sm:gap-10 max-xs:gap-7 xs:px-10 text-3 header position-fixed max-xs:flex-justify-center gap-12 sm:gap-10 max-xs:gap-7 xs:px-10 z-10 color-dark-800 w-full top-0 flex-items-center flex-justify-start flex bg-slate-100 h-16 '>
            <h1 className='font-bold text-4'>Quel est l'intervalle&nbsp;?</h1>
        </header>
    );
}
