import AnswerButtons from "./AnswerButtons";
import Controls from "./Controls";

export function GameBoard() {
    return (
        <div className='gap-15 container-margin-y-auto flex-col flex position-absolute top-16 bottom-0 left-0 right-0'>
            <Controls />
            <AnswerButtons />
        </div>
    );
}
