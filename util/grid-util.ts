import { Cardinals, CoordinateXY } from "./types";

export function getAllCardinalCoordinates(coord: CoordinateXY): {
  [s in Cardinals]: CoordinateXY;
} {
  return {
    north: getCardinalCoordinate(coord, "north"),
    south: getCardinalCoordinate(coord, "south"),
    east: getCardinalCoordinate(coord, "east"),
    west: getCardinalCoordinate(coord, "west"),
  };
}

export function getAllCardinalCoordinatesIter(
  coord: CoordinateXY,
  excludeCoord?: Cardinals[]
): CoordinateXY[] {
  const coordList = [];
  if (!excludeCoord) {
    return [
      getCardinalCoordinate(coord, "north"),
      getCardinalCoordinate(coord, "south"),
      getCardinalCoordinate(coord, "east"),
      getCardinalCoordinate(coord, "west"),
    ];
  }

  if (!excludeCoord.includes("north")) {
    coordList.push(getCardinalCoordinate(coord, "north"));
  }

  if (!excludeCoord.includes("south")) {
    coordList.push(getCardinalCoordinate(coord, "south"));
  }
  if (!excludeCoord.includes("east")) {
    coordList.push(getCardinalCoordinate(coord, "east"));
  }
  if (!excludeCoord.includes("west")) {
    coordList.push(getCardinalCoordinate(coord, "west"));
  }

  return coordList
}

function getCardinalCoordinate(
  coord: CoordinateXY,
  cardinal: Cardinals
): CoordinateXY {
  switch (cardinal) {
    case "north":
      return { x: coord.x, y: coord.y - 1 };
    case "south":
      return { x: coord.x, y: coord.y + 1 };
    case "west":
      return { x: coord.x - 1, y: coord.y };
    case "east":
      return { x: coord.x + 1, y: coord.y };
  }
}

export function coordinateXYToString(coord: CoordinateXY) {
  return `${coord.x}:${coord.y}`
}
