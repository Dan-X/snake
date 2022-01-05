import { useCallback, useEffect, useState } from "react";

import { aStar, aStarStepwise } from "../pathFinding/aStar";

export const usePathfinding = (
  updating: boolean,
  gameOver: boolean,
  snake: [number, number][],
  wall: [number, number][],
  apple: [number, number],
  boardSize: number
) => {
  const [path, setPath] = useState<[number, number][]>([]);
  const [closedNodes, setClosedNodes] = useState<[number, number][]>([]);
  const [openNodes, setOpenNodes] = useState<[number, number][]>([]);
  const [step, setStep] = useState(0)
  // const [hasNextStep, setHasNextStep] = useState(true)
  useEffect(() => {
    if (!updating && !gameOver) {
      const { path, closedNodes, openNodes, hasNextStep } = aStarStepwise(step, snake[snake.length - 1], apple, boardSize, [...wall, ...snake]);
      setPath(path.map((node) => node.coord));
      setClosedNodes(closedNodes.map((node) => node.coord));
      setOpenNodes(openNodes.map((node) => node.coord));
      // console.log(hasNextStep)
      if(hasNextStep) {
        setTimeout(()=>setStep(prev => prev+1),10)
      }
      // setHasNextStep(hasNextStep)
    }
  }, [apple, boardSize, gameOver, snake, step, updating, wall]);

  const resetStep = () => {
    setPath([]);
    setClosedNodes([]);
    setOpenNodes([]);
    setStep(0);
  }

  return { path, closedNodes, openNodes, resetStep};
};
