import Button from "./Button";
import BackIcon from "../../assets/images/back.svg?react";

export default function ButtonBack({ onClick }: { onClick: () => void }) {
    return (
        <div className='flex w-full '>
            <Button
                onClick={onClick}
                classes='text-5.5  px-2.25 py-1.25 flex flex-items-center flex-justify-center border-1 border-solid border-theme-light/40 bg-theme-light/5 rounded-2 hover:bg-white/20'>
                <BackIcon />
            </Button>
        </div>
    );
}
