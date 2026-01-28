import type { ButtonProps } from "../../libs/types";
import Utils from "../../utils/utils";
import React from "react";

const Button = React.memo(function Button({
    label = "",
    onClick = () => {},
    classes = "",
    variant = "",
    variants = {},
    children = null,
    ref = null,
}: ButtonProps) {
    const variantClasses = Utils.ensureArrayOfStrings(variant ? variants?.[variant] : "");

    const buttonsClasses = ["cursor-pointer", "btn", ...Utils.ensureArrayOfStrings(classes), ...variantClasses];

    let child: React.ReactNode = children;
    const htmlFragment = Utils.HTMLFromString(label);
    if (htmlFragment && htmlFragment.childNodes && htmlFragment.childNodes.length > 0) {
        child = Array.from(htmlFragment.childNodes).map((node, _) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // @ts-ignore
                return React.createElement(node.tagName.toLowerCase(), {}, node.textContent);
            }
            return null;
        });
    }

    return (
        <button ref={ref} role='button' className={buttonsClasses.join(" ")} onClick={onClick}>
            {child}
        </button>
    );
});

export default Button;
