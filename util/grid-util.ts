import { Cardinals, CoordinateXY, Ordinals } from "./types";

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


/**
 * 
 * @param coord current coordinate to use as anchor point for grabbing offsets
 * @param excludeCoord  any ordinals to exclude from retrieval
 * @param offset how many tiles away from the current coordinate to offset the ordinals, default is 1
 * @returns an array of coordinates
 */
export function getAllOrdinalCoordinates(
  coord: CoordinateXY,
  excludeCoord: Ordinals[] = [],
  offset = 1,
): CoordinateXY[] {
  const coordList = [];

  const ordinals = [
    "north", "south", "east", "west"
  ]

  for (const ordinal in ordinals) {
    if (!excludeCoord.includes(ordinal as Ordinals)) {
      coordList.push(getOrdinalCoordinate(coord, ordinal as Ordinals, offset))
    }
  }

  return coordList
}

export function getAllCardinalCoordinatesIterWithOffset(
  coord: CoordinateXY,
  excludeCoord: Cardinals[] = [],
  offset = 1,
): CoordinateXY[] {
  const coordList = [];

  const cardinals = [
    "north", "south", "east", "west"
  ]

  for (const cardinal in cardinals) {
    if (!excludeCoord.includes(cardinal as Cardinals)) {
      coordList.push(getCardinalCoordinate(coord, cardinal as Cardinals, offset))
    }
  }

  return coordList
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

function getOrdinalCoordinate(
  coord: CoordinateXY,
  ordinal: Ordinals,
  offset: number = 1
): CoordinateXY {
  switch (ordinal) {
    case "northeast":
      return { x: coord.x + offset, y: coord.y - offset };
    case "northwest":
      return { x: coord.x - offset, y: coord.y - offset };
    case "southeast":
      return { x: coord.x + offset, y: coord.y + offset };
    case "southwest":
      return { x: coord.x - offset, y: coord.y + offset };
  }
}

function getCardinalCoordinate(
  coord: CoordinateXY,
  cardinal: Cardinals,
  offset: number = 1
): CoordinateXY {
  switch (cardinal) {
    case "north":
      return { x: coord.x, y: coord.y - offset };
    case "south":
      return { x: coord.x, y: coord.y + offset };
    case "west":
      return { x: coord.x - offset, y: coord.y };
    case "east":
      return { x: coord.x + offset, y: coord.y };
  }
}

export function coordinateXYToString(coord: CoordinateXY) {
  return `${coord.x}:${coord.y}`
}
