import { Cardinals, CoordinateXY } from "./types";

export function getAllCardinalCoordinates(coord: CoordinateXY): {[s in Cardinals]: CoordinateXY} {
  return {
    north: getCardinalCoordinate(coord, "north"),
    south: getCardinalCoordinate(coord, "south"),
    east: getCardinalCoordinate(coord, "east"),
    west: getCardinalCoordinate(coord, "west"),
  }
}

function getCardinalCoordinate(coord: CoordinateXY, cardinal: Cardinals): CoordinateXY {
  switch(cardinal) {
    case "north": return {x: coord.x, y: coord.y - 1};
    case "south": return {x: coord.x, y: coord.y + 1};
    case "west": return {x: coord.x - 1, y: coord.y};
    case "east": return {x: coord.x + 1, y: coord.y};
  }
}