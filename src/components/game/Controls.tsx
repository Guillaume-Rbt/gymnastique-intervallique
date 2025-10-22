import ButtonPlay from "./ButtonPlay";
import Volume from "../ui/Volume";

export default function Controls() {
    return (
        <div className='flex gap-2 flex-justify-center'>
            <ButtonPlay />
            <Volume />
        </div>
    );
}
