export default function Button({ label, onClick = () => { }, classes }: { label: string; onClick?: () => void; classes: string[] }) {


    const buttonsClasses = ["cursor-pointer", 'btn', ...classes]


    return <button className={buttonsClasses.join(" ")} onClick={onClick}>{label}</button>
}