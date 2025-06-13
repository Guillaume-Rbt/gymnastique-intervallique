type ButtonProps = {
    classes: string[];
    onClick: () => void;
    children: string;
};



export default function Button({ classes, onClick, children }: ButtonProps) {


    const buttonClasses = ["rounded", "flex", "flex-content-center", "flex", ...classes].join(' ').trim();


    return <div onClick={onClick} className={buttonClasses}>
        <span dangerouslySetInnerHTML={{ __html: children }}></span>
    </div>
}