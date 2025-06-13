
import GameManager from "./libs/GameManager"
import Button from "./components/Buttons"
import { buttons } from "./utils/constants"

function App() {

  const gameManager = new GameManager()

  gameManager.startGame()

  console.log(gameManager)



  return (
    <>
      {buttons.map((button, index) => {
        return <Button key={button} classes={[`btn-response-${index + 1}`, "btn-response"]} onClick={() => { }}>{button}</Button>
      })}
    </>
  )
}

export default App
