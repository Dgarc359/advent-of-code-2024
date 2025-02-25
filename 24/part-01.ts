import { Queue } from "@/util/queue";
import fs from "node:fs"

const input = fs.readFileSync("./input.txt").toString();
const split = input.split("\n")
const idxOfNewline = split.indexOf("")!

const initialWireValsArr = split.slice(0, idxOfNewline)
const gateConnections = split.slice(idxOfNewline + 1)



class WireValues extends Map<string, 1 | 0> {}

const wireValues = new WireValues()

for (const wireValueStr of initialWireValsArr) {
  const [key, valStr] = wireValueStr.split(":")
  const val = Number(valStr.trim()).valueOf() as 1 | 0

  wireValues.set(key, val)
}

function runThroughLogicGate(gate: string, a: 1 | 0, b: 1 | 0) {
  switch(gate) {
    case "AND": {
      return a && b
    }
    case "OR": {
      return a || b
    }
    case "XOR": {
      return a != b
    }
    default: {
      throw new Error("You gave us a gate value that doesnt exist")
    }
  }
}


const zWires = []

const gateConnectionQ = new Queue<string>(gateConnections)

while(gateConnectionQ.size()) {
  const gateConnectionInstr = gateConnectionQ.dequeue()!

  const [formula, resultKey] = gateConnectionInstr.split("->").map(v => v.trim())

  const [a, op, b] = formula.split(" ").map(v => v.trim())
  const aVal = wireValues.get(a)

  const bVal = wireValues.get(b)

  if (aVal === undefined || bVal === undefined) {
    gateConnectionQ.enqueue(gateConnectionInstr)
    continue;
  }


  wireValues.set(resultKey, runThroughLogicGate(op, aVal, bVal) ? 1 : 0)

  if (resultKey.startsWith("z")) {
    zWires.push(resultKey)
  }
}

const sortedZKeys = zWires.sort()

const mappedZ = sortedZKeys.reverse().map(v => wireValues.get(v)!)

const intZ = parseInt(mappedZ.join(""), 2)

console.log(intZ)


