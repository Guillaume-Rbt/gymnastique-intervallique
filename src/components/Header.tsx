import { useGameContext } from "../hooks/useGameContext";

export default function Header() {

    const { progress } = useGameContext();


    return <div className="header position-fixed z-10 color-dark-800 w-full top-0 flex-items-center flex bg-white h-20 mb-2">
        <div className="flex">
            <p>{`${progress.current}/${progress.total}`}</p>
        </div>
    </div>
}