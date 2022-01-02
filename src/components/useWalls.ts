import { useCallback, useState } from 'react'

const getARandomWall = (wallLength: number, forbitArea: [number, number][], boardSize: number) => {
  let wall = [[
    Math.floor(Math.random() * (boardSize-wallLength-2)+1),
    Math.floor(Math.random() * (boardSize-wallLength-2)+1),
  ]] as [number, number][]
  const vertical = Math.random() < 0.5 ? false : true;

  for (let i = 0; i < wallLength; i++) {
    const newStep = [
      vertical? 0 : 1,
      vertical? 1 : 0
    ]
    const newPosition = [
      wall[wall.length - 1][0] + newStep[0],
      wall[wall.length - 1][1] + newStep[1],
    ] as [number, number]
    wall.push(newPosition);
  }
  if(wall.some(block => forbitArea.some(area => area[0]===block[0] && area[1]===block[1]))){
    wall = getARandomWall(wallLength, forbitArea, boardSize);
  }
  return wall;
}

const getWalls = (numOfWalls: number, wallLength: number, forbitArea: [number, number][], boardSize: number) => {
  let walls = [] as [number, number][];
  for (let i = 0; i < numOfWalls; i++) {
    const newWall = getARandomWall(wallLength, forbitArea, boardSize);
    console.log("wall: ", newWall)
    walls = [...walls, ...newWall]
  }
  return walls
}

export const useWalls = (numberOfWalls: number, wallLength: number, boardSize: number, ) => {
  const [wall, setWall] = useState(() => getWalls(numberOfWalls, wallLength, [], boardSize))

  const refreshWalls = useCallback((forbitArea: [number, number][]) => {
    const newWalls = getWalls(numberOfWalls, wallLength, forbitArea, boardSize)
    setWall(newWalls);
  },[boardSize, numberOfWalls, wallLength])
  return { wall, refreshWalls}
}