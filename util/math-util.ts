import { CoordinateXY } from "./types";



export function getNextCoordinateBasedOffSlope(startingCoord: CoordinateXY, deltaSlope: CoordinateXY, delta: "positive" | "negative"): CoordinateXY {
  switch(delta) {
    case "positive": return { x: startingCoord.x + deltaSlope.x, y: startingCoord.y + deltaSlope.y};
    case "negative": return { x: startingCoord.x + (-deltaSlope.x), y: startingCoord.y + (-deltaSlope.y)}
  }
}

export function findSlopeOfTwoPoints(p1: CoordinateXY, p2: CoordinateXY): CoordinateXY {
  return { x: p2.x - p1.x, y: p2.y - p1.y }
}