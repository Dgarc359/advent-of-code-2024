import { Graph, Edge, Vertex } from "@/util/graph"
import { Queue } from "@/util/queue";
import fs from "node:fs"

const input = fs.readFileSync("./input.txt").toString()

const graph = new Graph();

for (const connection of input.split("\n")) {
  const [source, target] = connection.split("-")

  const sourceVertex = graph.getOrCreateVertex(source)
  const targetVertex = graph.getOrCreateVertex(target)

  sourceVertex.addEdge(targetVertex)
  targetVertex.addEdge(sourceVertex)

  graph.insertVertex(sourceVertex)
  graph.insertVertex(targetVertex)
}

function getComputersWithThreeConnections(graph: Graph) {
  const vertexQ = new Queue<Vertex>();

  graph.vertexForEach((k, v) => {
    if (v.getNumOfEdges() >= 2) {
      vertexQ.enqueue(v)
    }
  })

  return vertexQ
}

graph.writeObsidianCompatibleMarkdown('./out')


// this will give us a starting point of vertexes to look at
// any other ones are not even worth considering. Including when we start traversing
// the graph
const initialVertexQ = getComputersWithThreeConnections(graph)

function createCycleKey(v1: Vertex, v2: Vertex, v3: Vertex): string {
  const vertices = [v1.getValue(), v2.getValue(), v3.getValue()].sort()

  return vertices.join("-")
}

function findCyclicTriplets(q: Queue<Vertex>) {
  const cyclicTriplets: Record<string, boolean> = {}
  let numOfTripletsContainingTs = 0
  while(q.size()) {
    const originVertex = q.dequeue()!

    for (const vertexTwo of originVertex.getEdges()) {
      for (const vertexThree of vertexTwo.getEdges()) {
        if (vertexThree.hasEdgeToVertex(originVertex)) {
          const cycleKey = createCycleKey(originVertex, vertexTwo, vertexThree)

          // cycle has already been found
          if (cyclicTriplets[cycleKey]) {
            continue;
          }

          if([originVertex, vertexTwo, vertexThree].some((v) => v.getValue().startsWith("t"))) {
            numOfTripletsContainingTs += 1
          }

          cyclicTriplets[cycleKey] = true
        }
      }
    }
  }

  return [Object.keys(cyclicTriplets), numOfTripletsContainingTs]
}

const triplets = findCyclicTriplets(initialVertexQ)

console.log(triplets[1])

