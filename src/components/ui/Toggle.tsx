import { useCallback } from "react";
import React from "react";
import type { DataAttributes } from "../../libs/types";

const Toggle = React.memo(function Toggle({
    value = false,
    label,
    onChange = null,
    ...props
}: {
    value?: boolean;
    onChange?: null | ((v: boolean) => void);
    label: string;
} & DataAttributes) {
    const handleClick = useCallback(() => {
        if (!onChange) return;
        onChange(!value);
    }, [onChange, value]);

    return (
        <div className='flex flex-items-center gap-3' {...(onChange ? { onClick: handleClick } : {})} {...props}>
            <div className='h-5 w-8 border-2 border-solid border-theme-accent rounded-3.5 position-relative cursor-pointer shrink-0'>
                <span
                    className={`${value ? "bg-theme-accent left-3.5" : "bg-theme-accent/35 left-.5"} h-3.5 w-3.5 rounded-full position-absolute top-[50%] translate-y-[-50%] transition-all duration-200`}></span>
            </div>
            {label && (
                <span
                    dangerouslySetInnerHTML={{ __html: label }}
                    className={`color-theme-light transition-opacity duration-200 ${value ? "opacity-100" : "opacity-60"}`}></span>
            )}
        </div>
    );
});

export default Toggle;
