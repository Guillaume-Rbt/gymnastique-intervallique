import AnswerButtons from "./AnswerButtons";

export function GameBoard() {
    return (
        <div className='gap-15 container-margin-y-auto flex-col flex scrollbar-hover position-absolute top-16 bottom-15 left-0 right-0 p-y-4'>
            <AnswerButtons />
        </div>
    );
}
