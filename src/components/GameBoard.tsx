import AnswerButtons from "./AnswerButtons";
import PlayIcon from "../assets/images/play.svg?react";
import Button from "./Button";

export function GameBoard() {
    return (
        <div className='gap-15 container-margin-y-auto flex-col flex position-absolute top-16 bottom-0 left-0 right-0'>
            <Button
                classes={[
                    "color-slate-100",
                    "margin-x-auto",
                    "text-7",
                    "btn-primary",
                    "p-0",
                    "w-12",
                    "h-12",
                    "rounded-full",
                    "flex",
                    "flex-items-center",
                    "flex-justify-center",
                ]}
                aria-label='Play'>
                <PlayIcon />
            </Button>
            <AnswerButtons />
        </div>
    );
}
