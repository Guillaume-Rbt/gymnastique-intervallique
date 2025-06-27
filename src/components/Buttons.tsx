type ButtonProps = {
	classes: string[] | string;
	onClick: () => void;
	children: string | React.ReactNode;
	data: string | null;
};

export default function Button({ classes, onClick, children = "", data = null }: Partial<ButtonProps>) {
	const defaultClasses = ["btn"];

	const buttonClasses = Array.isArray(classes) ? [...defaultClasses, ...classes] : [classes, ...defaultClasses];

	return (
		<div {...(data && { "data-data": data })} onClick={onClick} className={buttonClasses.join(" ")}>
			{typeof children === "string" ? <span dangerouslySetInnerHTML={{ __html: children }}></span> : children}
		</div>
	);
}
