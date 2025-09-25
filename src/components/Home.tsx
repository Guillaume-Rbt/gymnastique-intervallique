import Button from "./Button";

export default function Home() {
    return (
        <div className='position-fixed w-full h-full bg-theme-blue z-100 flex flex-items-center flex-justify-center flex-col isolate'>
            <div className='position-absolute py-4.8 top-0 left-0 w-full h-full z--1'>
                <img
                    src='/images/keyboard.webp'
                    className='mask-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)] position-absolute w-full bottom-[20%]'
                />
                <div className='position-absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,var(--colors-theme-blue)_100%)] top-0 left-0'></div>
            </div>
            <h1 className='font-bold text-15 color-slate-100 text-center mb-6'>Gymnastique Intervallique</h1>
            <p className='color-slate-100'>Exercez votre oreille à la reconnaissance d'intervalles</p>
            <Button label='Commencer' classes={["btn-primary"]} />
        </div>
    );
}
