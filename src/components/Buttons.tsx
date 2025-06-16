type ButtonProps = {
    classes: string[] | string;
    onClick: () => void;
    children: string;
};



export default function Button({ classes, onClick, children }: ButtonProps) {


    const defaultClasses = ["btn"]


    const buttonClasses = Array.isArray(classes) ? [...defaultClasses, ...classes] : [classes, ...defaultClasses]


    return <div onClick={onClick} className={buttonClasses.join(" ")}>
        <span dangerouslySetInnerHTML={{ __html: children }}></span>
    </div>
}