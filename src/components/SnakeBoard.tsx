import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSnake } from './useSnake';
import { useWalls } from './useWalls';
interface Props {

}

const drawColors = {
  snake: '#377eb8',
  forbitArea: 'white', // '#fbb4ae',
  apple: '#e41a1c',
  walls: '#e5d8bd',
  border: '#000000',
  borderPause: '#fdb462',
  borderGameOver: '#fb8072',
}

const draw = (canvasRef: React.RefObject<HTMLCanvasElement>, snake: [number, number][], apple: [number, number], wall: [number, number][], forbitArea: [number, number][], pixelSize: number) => {
  if (!canvasRef.current) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = drawColors.forbitArea;
  forbitArea.forEach(block => ctx.fillRect(block[0] * pixelSize, block[1] * pixelSize, pixelSize, pixelSize))
  ctx.fillStyle = drawColors.snake;
  snake.forEach(block => ctx.fillRect(block[0] * pixelSize, block[1] * pixelSize, pixelSize, pixelSize))
  
  ctx.fillStyle = drawColors.apple;
  ctx.fillRect(apple[0] * pixelSize, apple[1] * pixelSize, pixelSize, pixelSize)
  ctx.fillStyle = drawColors.walls;
  wall.forEach(block => ctx.fillRect(block[0] * pixelSize, block[1] * pixelSize, pixelSize, pixelSize))
}


export const SnakeBoard = (props: Props) => {

  const canvasSize = 700;
  const boardSize = 50;
  const pixelSize = canvasSize / boardSize;
  const updateInterval = 50;
  const refreshWallsInterval = 30000;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const forbitArea = useRef<[number, number][]>()

  const { wall, refreshWalls } = useWalls(3, 10, boardSize)
  const {
    snake,
    snakeLength,
    apple,
    collision,
    resetSnake,
    updateSnake
  } = useSnake(wall, boardSize)

  const calculateSnakeForbitArea = (snake: [number, number][]) => {
    let neighourhood = [...snake];
    const surrounding = [[0,1],[0,2],[1,0],[2,0]]
    surrounding.forEach(s => {
      const newN1 = snake.map(block => [block[0]+s[0], block[1]+s[1]] as [number, number]);
      const newN2 = snake.map(block => [block[0]-s[0], block[1]-s[1]] as [number, number]);
      neighourhood = [...neighourhood, ...newN1, ...newN2]
    })
    return neighourhood;
  }
  forbitArea.current = [...calculateSnakeForbitArea(snake), apple];

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
    draw(canvasRef, snake, apple, wall, forbitArea.current || [], pixelSize);
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
        refreshWalls(forbitArea.current);
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


  const canvasStyle = gameOver ? { border: '2px solid red' } : updating ? { border: '2px solid black' } : { border: '2px solid orange' }

  return (
    <div>
      <div>
        {/* <input type="checkbox" id="scales" name="scales"
          onChange={() => { setIsUpdating(prev => !prev) }}
          checked={updating} />
        <label htmlFor="scales">On</label> */}
      </div>
      <canvas id="snakeboard" ref={canvasRef} width={canvasSize} height={canvasSize} style={canvasStyle} />
      <p>score: {snakeLength - 30}</p>
    </div>

  )
}
