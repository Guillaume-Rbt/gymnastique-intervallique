import { buttons, buttonsMobile, intervals } from '../utils/constantsMusical.js'
import { Button } from './button.jsx'
import {
    memo,
    useEffect,
    useState,
    useRef,
} from 'react'

export const ResponseButtonsMemo = memo(function ResponseButtons({
    callback = () => { },
    containerRef,
    registerButton
}) {
    let buttonList = []

    const prevWidth = useRef(window.innerWidth)
    const [buttonData, setButtonData] = useState(
        window.innerWidth <= 1175 ? buttonsMobile : buttons
    )

    useEffect(() => {
        const handleResize = () => {
            const currWidth = window.innerWidth
            if (currWidth <= 1175 && prevWidth.current > 1175) {
                setButtonData(buttonsMobile)
            } else if (currWidth > 1175 && prevWidth.current <= 1175) {
                setButtonData(buttons)
            }
            prevWidth.current = currWidth
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    buttonData.forEach((button, index) => {

        buttonList.push(
            <Button
                key={buttons[index].toLowerCase()}

                handleClick={(e) => {
                    callback(e)
                }}
                ref={(el) => el && registerButton(intervals[index], el)}
                dataValue={intervals[index]}
                text={button}
                type="buttons-respnse_response"
            ></Button>
        )
    })

    return (
        <div ref={containerRef} className="buttons-response">
            {buttonList}
        </div>
    )
})
