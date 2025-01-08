import { GridContainer } from "@/util/grid-container";
import { Queue } from "@/util/queue";
import { CoordinateXY } from "@/util/types";
import fs from "node:fs";

const inputFile = fs.readFileSync("input.txt").toString().split("\n");
const newlineRow = inputFile.indexOf("");

const mapString = inputFile.splice(0, newlineRow);
const instrString = inputFile.splice(1);

type MovementDirections = ">" | "<" | "^" | "v";

const movementMap: { [key in MovementDirections]: CoordinateXY } = {
  ">": { x: 1, y: 0 },
  "<": { x: -1, y: 0 },
  "^": { x: 0, y: -1 },
  v: { x: 0, y: 1 },
};

// create gridcontainer from map string
const mapGrid = new GridContainer<string, undefined>(undefined);

let robotCoord: CoordinateXY = { x: -1, y: -1 };

mapGrid.setHeight(mapString.length);
mapString.forEach((yRow, y) => {
  mapGrid.pushToGrid(yRow.split(""));
  mapGrid.setWidth(yRow.split("").length);
  yRow.split("").forEach((char, x) => {
    if (char === "@") {
      // we could theoretically just start our movement instructions here, but
      // I want to map out the entire ... 'map', just because why not.
      robotCoord = { x, y };
    }
  });
});

class ObjectInMotion {
  initialCoordinate: CoordinateXY;
  targetCoordinate: CoordinateXY;
  value: string;

  constructor(
    initialCoord: CoordinateXY,
    targetCoord: CoordinateXY,
    value: string
  ) {
    this.initialCoordinate = initialCoord;
    this.targetCoordinate = targetCoord;
    this.value = value;
  }
}

for (const instructionStringRow of instrString) {
  for (const instructionString of instructionStringRow.split("")) {
    const entityStack: ObjectInMotion[] = [];
    const movementVector = movementMap[instructionString as MovementDirections];
    entityStack.push(
      new ObjectInMotion(
        robotCoord,
        {
          x: robotCoord.x + movementVector.x,
          y: robotCoord.y + movementVector.y,
        },
        "@"
      )
    );

    while (entityStack.length) {
      const currentEntity = entityStack.pop();
      if(currentEntity === undefined) {
        break;
      }

      const targetGridEntity = mapGrid.getCoordGridItem(currentEntity.targetCoordinate);
      if (
        targetGridEntity === undefined ||
        targetGridEntity === "#"
      ) {
        break;
      }

      if (targetGridEntity === ".") {
        mapGrid.setCoordGridItem(currentEntity.initialCoordinate, ".");
        mapGrid.setCoordGridItem(currentEntity.targetCoordinate, currentEntity.value);
        if(currentEntity.value === '@') {
          // we set the robot coord, let's adjust it
          robotCoord = currentEntity.targetCoordinate
        }
      } else {
        entityStack.push(currentEntity)
        entityStack.push(new ObjectInMotion(currentEntity.targetCoordinate, {
          x: currentEntity.targetCoordinate.x + movementVector.x,
          y: currentEntity.targetCoordinate.y + movementVector.y
        }, targetGridEntity));
      }
    }
  }
}

let sum = 0;
for (let y = 0; y < mapGrid.getHeight(); y++) {
  for (let x = 0; x < mapGrid.getWidth(); x++) {
    const mapGridItem = mapGrid.getCoordGridItem({x, y});
    if(!mapGridItem) throw new Error("????");

    if (mapGridItem === 'O') {
      sum += (100 * y) + x
    }
  }
}

console.log(`we got sum ${sum}`)


