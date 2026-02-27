import AnswerButtons from "./AnswerButtons";
import Scrollbar from "../ui/Scrollbar";
import { useRef } from "react";

export function GameBoard() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const elementRef = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={containerRef}
            className='overflow-hidden gap-15 container-margin-y-auto flex-col flex position-absolute top-16 bottom-16 left-0 right-0 p-y-4'>
            <Scrollbar containerRef={containerRef} elementRef={elementRef}></Scrollbar>

            <AnswerButtons ref={elementRef} />
        </div>
    );
}
