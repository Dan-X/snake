import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CompletionTriggerKind } from 'typescript';

interface Props {

}


const draw = (canvasRef: React.RefObject<HTMLCanvasElement>, snake: [number, number][], apple: [number, number], pixelSize: number) => {
  if (!canvasRef.current) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  //Our first draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000'
  snake.forEach(block => ctx.fillRect(block[0] * pixelSize, block[1] * pixelSize, pixelSize, pixelSize))
  ctx.fillStyle = '#ff0000'
  ctx.fillRect(apple[0] * pixelSize, apple[1] * pixelSize, pixelSize, pixelSize)

}

const hasCollision = (snake: [number, number][], newHead: [number, number]) => snake.some(block => block[0] === newHead[0] && block[1] === newHead[1]) 
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
  snakeLength: 10,
  snake: [[0, 0]] as [number, number][],
  gameOver: false,
  getApple: (boardSize: number) => [
    Math.floor(Math.random() * boardSize),
    Math.floor(Math.random() * boardSize),
  ] as [number, number]
}

export const SnakeBoard = (props: Props) => {

  const canvasSize = 700;
  const boardSize = 50;
  const pixelSize = canvasSize / boardSize;
  const updateInterval = 50;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [velocity, setVelocity] = useState<[number, number]>(defaultParameters.velocity);
  const [snakeLength, setSnakeLenth] = useState(defaultParameters.snakeLength);
  const [snake, setSnake] = useState<[number, number][]>(defaultParameters.snake);
  const [gameOver, setGameOver] = useState(defaultParameters.gameOver);
  const [apple, setApple] = useState<[number, number]>(defaultParameters.getApple(boardSize));
  const [canChangeDirection, setCanChangeDirection] = useState(false);
  const [updating, setIsUpdating] = useState(true);

  const toggleUpdate = () => setIsUpdating(prev => !prev);
  const restartGame = useCallback(() => {
    setVelocity(defaultParameters.velocity);
    setSnakeLenth(defaultParameters.snakeLength);
    setSnake(defaultParameters.snake);
    setGameOver(defaultParameters.gameOver);
    toggleUpdate();
  }, [])

  const keydownHdl = useCallback((e: KeyboardEvent) => {
    if (!canChangeDirection) return;
    switch (e.key) {
      case "ArrowUp":
        setVelocity(prev => prev[0] === 0 ? prev : [0, -1])
        setCanChangeDirection(false);
        break;
      case "ArrowDown":
        setVelocity(prev => prev[0] === 0 ? prev : [0, 1])
        setCanChangeDirection(false);
        break;
      case "ArrowLeft":
        setVelocity(prev => prev[1] === 0 ? prev : [-1, 0])
        setCanChangeDirection(false);
        break;
      case "ArrowRight":
        setVelocity(prev => prev[1] === 0 ? prev : [1, 0])
        setCanChangeDirection(false);
        break;
      case "Escape":
      case " ":
        if (gameOver) { restartGame() } else { toggleUpdate() }
        break;
    }
  }, [canChangeDirection, gameOver, restartGame])



  const updateBoard = useCallback(() => {

    setSnake(snake => {
      const newSnake = [...snake]
      const snakeHead = snake[snake.length - 1]
      const newHead = getNewHead(snakeHead, velocity, boardSize);

      if (hasCollision(snake, newHead)) {
        toggleUpdate();
        setGameOver(true)
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

  }, [apple, snakeLength, velocity])

  useEffect(() => {
    const interval = setInterval(() => {
      if (updating && !gameOver) {
        setCanChangeDirection(true);
        updateBoard();
      }
    }, updateInterval);
    return () => {
      clearInterval(interval);
    };
  }, [gameOver, updateBoard, updating]);

  useEffect(() => {
    draw(canvasRef, snake, apple, pixelSize);
  }, [apple, pixelSize, snake])

  useEffect(() => {
    window.addEventListener('keydown', keydownHdl);

    return () => {
      window.removeEventListener('keydown', keydownHdl);
    };
  }, [keydownHdl])

  const canvasStyle = gameOver ? { border: '2px solid red' } : { border: '1px solid black' }

  return (
    <div>
      <div>
        <input type="checkbox" id="scales" name="scales"
          onChange={() => { setIsUpdating(prev => !prev) }}
          checked={updating} />
        <label htmlFor="scales">On</label>
      </div>
      <canvas id="snakeboard" ref={canvasRef} width={canvasSize} height={canvasSize} style={canvasStyle} />
      <p>lengh: {snakeLength}</p>
    </div>

  )
}
