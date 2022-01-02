import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSnake } from './useSnake';
import { useWalls } from './useWalls';
interface Props {

}

const draw = (canvasRef: React.RefObject<HTMLCanvasElement>, snake: [number, number][], apple: [number, number], wall:[number, number][], pixelSize: number) => {
  if (!canvasRef.current) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0000aa'
  snake.forEach(block => ctx.fillRect(block[0] * pixelSize, block[1] * pixelSize, pixelSize, pixelSize))
  ctx.fillStyle = '#ff0000'
  ctx.fillRect(apple[0] * pixelSize, apple[1] * pixelSize, pixelSize, pixelSize)
  ctx.fillStyle = '#000000'
  wall.forEach(block => ctx.fillRect(block[0] * pixelSize, block[1] * pixelSize, pixelSize, pixelSize))
}


export const SnakeBoard = (props: Props) => {

  const canvasSize = 700;
  const boardSize = 50;
  const pixelSize = canvasSize / boardSize;
  const updateInterval = 50;
  const refreshWallsInterval = 3000;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const forbitArea = useRef<[number,number][]>()

  const { wall, refreshWalls } = useWalls(3, 10, boardSize)
  const {
    snake,
    snakeLength,
    apple,
    collision,
    resetSnake,
    updateSnake
  } = useSnake(wall, boardSize)
  forbitArea.current = [...snake, apple];
  
  const [gameOver, setGameOver] = useState(false);
  const [updating, setIsUpdating] = useState(true);


  const restartGameHdl = useCallback(() => {
    resetSnake();
    setGameOver(false);
    setIsUpdating(true);
  }, [resetSnake])

  const keydownHdl = useCallback((e: KeyboardEvent) => {
    switch (e.key) {

      case "Escape":
      case " ":
        console.log('spacekey')
        if (gameOver) {
          restartGameHdl()
        } else {
          setIsUpdating(prev => !prev);
        }
        break;
    }
  }, [gameOver, restartGameHdl])

  useEffect(() => {
    draw(canvasRef, snake, apple, wall, pixelSize);
  }, [apple, pixelSize, snake, wall])

  useEffect(() => {
    const interval = setInterval(() => {
      if (updating && !gameOver) {
        updateSnake();
      }
    }, updateInterval);
    return () => {
      clearInterval(interval);
    };
  }, [gameOver, updateSnake, updating]);

  useEffect(() => {
    console.log('setUpdateWallInterval')
    const interval = setInterval(() => {
      if (updating && !gameOver && forbitArea.current) {
        refreshWalls(forbitArea.current );
      }
    }, refreshWallsInterval);
    return () => {
      clearInterval(interval);
    };
  }, [gameOver, refreshWalls, updating]);

  useEffect(() => {
    window.addEventListener('keydown', keydownHdl);

    return () => {
      window.removeEventListener('keydown', keydownHdl);
    };
  }, [keydownHdl])

  useEffect(() => {
    if (collision) {
      setIsUpdating(prev => !prev);
      setGameOver(true)
    }
  }, [collision])


  const canvasStyle = gameOver ? { border: '2px solid red' } : { border: '2px solid black' }

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
