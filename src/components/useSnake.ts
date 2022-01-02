import { useCallback, useEffect, useState } from 'react'



const hasCollision = (forbitArea: [number, number][], newHead: [number, number]) => forbitArea.some(block => block[0] === newHead[0] && block[1] === newHead[1]) 
const getNewHead = (snakeHead: [number, number], velocity: [number, number], boardSize: number) => snakeHead.map((headCoord, i) => {
  // if (i===1) console.log(headCoord, headCoord + velocity[i])
  return (headCoord + velocity[i] > boardSize - 1) ? 0 : (headCoord + velocity[i] < 0 ? boardSize - 1 : headCoord + velocity[i])
}) as [number, number]

const getNewApple = (snake: [number, number][], boardSize: number) => {
  let newApple = [
    Math.floor(Math.random() * boardSize),
    Math.floor(Math.random() * boardSize),
  ] as [number, number]
  if(hasCollision(snake, newApple)) {
    newApple = getNewApple(snake, boardSize);
  }
  return newApple;
}

const defaultParameters = {
  velocity: [1, 0] as [number, number],
  snakeLength: 30,
  snake: [[0, 0]] as [number, number][],
  gameOver: false,
  getApple: (boardSize: number) => [
    Math.floor(Math.random() * boardSize),
    Math.floor(Math.random() * boardSize),
  ] as [number, number]
}

export const useSnake = (forbitArea: [number, number][],boardSize: number, ) => {

  const [velocity, setVelocity] = useState<[number, number]>(defaultParameters.velocity);
  const [snakeLength, setSnakeLenth] = useState(defaultParameters.snakeLength);
  const [snake, setSnake] = useState<[number, number][]>(defaultParameters.snake);
  const [apple, setApple] = useState<[number, number]>(defaultParameters.getApple(boardSize));
  const [canChangeDirection, setCanChangeDirection] = useState(false);
  const [collision, setCollision] = useState(false);

  const resetSnake= useCallback(() => {
    setVelocity(defaultParameters.velocity);
    setSnakeLenth(defaultParameters.snakeLength);
    setSnake(defaultParameters.snake);
    setCollision(false)
  }, [])

  const ctlKeydownHdl = useCallback((e: KeyboardEvent) => {
    if (!canChangeDirection) return;
    switch (e.key) {
      case "ArrowUp":
      case "w":
        setVelocity(prev => prev[0] === 0 ? prev : [0, -1])
        setCanChangeDirection(false);
        break;
      case "ArrowDown":
      case "s":
        setVelocity(prev => prev[0] === 0 ? prev : [0, 1])
        setCanChangeDirection(false);
        break;
      case "ArrowLeft":
      case "a":
        setVelocity(prev => prev[1] === 0 ? prev : [-1, 0])
        setCanChangeDirection(false);
        break;
      case "ArrowRight":
      case "d":
        setVelocity(prev => prev[1] === 0 ? prev : [1, 0])
        setCanChangeDirection(false);
        break;
    }
  }, [canChangeDirection])



  const updateSnake= useCallback(() => {
    setSnake(snake => {
      const newSnake = [...snake]
      const snakeHead = snake[snake.length - 1]
      const newHead = getNewHead(snakeHead, velocity, boardSize);

      if (hasCollision([...snake, ...forbitArea], newHead)) {
        setCollision(true)
        // setIsUpdating(prev => !prev);
        // setGameOver(true)
      }

      if (newHead[0] === apple[0] && newHead[1] === apple[1]) {
        setSnakeLenth(prev => prev + 1)
        newSnake.push(newHead);
        
        setApple(getNewApple(snake, boardSize))
      } else if (snake.length === snakeLength) {
        newSnake.shift();
        newSnake.push(newHead);
      } else {
        newSnake.push(newHead);
      }
      return newSnake
    })
    setCanChangeDirection(true);

  }, [apple, boardSize, forbitArea, snakeLength, velocity])

  

  useEffect(() => {
    window.addEventListener('keydown', ctlKeydownHdl);

    return () => {
      window.removeEventListener('keydown', ctlKeydownHdl);
    };
  }, [ctlKeydownHdl])


  return { 
    snake,
    snakeLength,
    apple,
    collision,
    resetSnake,
    updateSnake,
  }
}
