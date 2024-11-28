import { useGameContext } from '../hooks/useGameContext.jsx'
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

    const { allowedIntervals } = useGameContext()

    console.log(allowedIntervals)

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

    allowedIntervals.forEach((button, key) => {

        buttonList.push(
            <Button
                key={button}

                handleClick={(e) => {
                    callback(e)
                }}
                ref={(el) => el && registerButton(button, el)}
                dataValue={intervals[key]}
                text={buttonData[key]}
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
