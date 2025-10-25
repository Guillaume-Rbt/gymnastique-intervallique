import AnswerButtons from "./AnswerButtons";
import Controls from "./Controls";

export function GameBoard() {
    return (
        <div className='gap-15 container-margin-y-auto flex-col flex overflow-scroll position-absolute top-16 bottom-12 left-0 right-0'>
            <Controls />
            <AnswerButtons />
        </div>
    );
}
