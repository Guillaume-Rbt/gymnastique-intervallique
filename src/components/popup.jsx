import { motion } from "motion/react"
import { forwardRef } from "react"

const popup = forwardRef(({ children, className = [] }, ref) => {
    return <div ref={ref} className={`${"popup"}${className.join(' ')}`}>
        {children}
    </div>
})

export const MotionPopup = motion(popup)