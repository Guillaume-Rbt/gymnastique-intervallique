
import GameManager from "./libs/GameManager"
import { buttons } from "./utils/constants"
import { useRef } from "react"
import Header from "./components/Header"
import Button from "./components/Buttons"

function App() {

  const gameManager = useRef(new GameManager()).current

  gameManager.startGame()

  return (
    <>
      <Header />

      <div className="buttons-container grid grid-col-2-xxl">

        {buttons.map((button, index) => {
          /*unocss*/
          const classeNameString = `btn-response-${index + 1} btn-response`
          return <Button key={button} classes={classeNameString} onClick={() => { }}>{button}</Button>
        })}
      </div>

    </>
  )
}

export default App
