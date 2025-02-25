// sidenote:
// I've implemented different versions of a graph
// we have options here. We can either do a flat graph
// where you have a list of edges and vertices
// you can do reverse indexing on that to get more efficient node retrieval
// but it's a good way to store the info since we don't have to worry about recursively
// pointing to different nodes in the graph

// or a 'linked list' type of graph
// where each vertex just points to other vertices available through edges

import fs from "node:fs";



export class Vertex {
    value: string

    private edges: Vertex[] = []

    constructor(value: string) {
        this.value = value
    }

    getValue() { return this.value }

    addEdge(t: Vertex) {
        if(t.getValue() === this.getValue()) {
            // we don't want to add an edge to ourselves
            return;
        }

        if (this.edges.some(v => v.getValue() === t.getValue())) {
            // we already have this vertex in the list of edges
            // we don't need to add it again
            return;
        }
        this.edges.push(t)
    }
    getEdges() { return this.edges }

    hasEdgeToVertex(t: Vertex) {
        return this.edges.some((e) => e.getValue() === t.getValue())
    }

    getNumOfEdges(): number {
        return this.edges.length
    }
}

export class Edge {
    source: Vertex
    targets: Vertex[] = []

    constructor(source: Vertex) {
        this.source = source;
    }

    addTarget(t: Vertex) {
        if (this.targets.some(v => v.getValue() === t.getValue())) {
            // we already have this vertex in the list of edges
            // we don't need to add it again
            return;
        }
        this.targets.push(t)
    }

    createEdgeKey(): string {
        return this.source.getValue()
    }

    // find a target node in the list of targets available from the source node
    targetsContains(v: Vertex): boolean {
        return this.targets.some((t) => t.getValue() === v.getValue())
    }
}

export class Graph {
    edges: Map<string, Edge> = new Map()
    vertices: Map<string, Vertex> = new Map()

    // handles create and update
    insertVertex(v: Vertex) {
        this.vertices.set(v.getValue(), v)
    }

    getVertex(key: string) {
        return this.vertices.get(key)
    }

    getOrCreateVertex(key: string) {
        const v = this.getVertex(key)

        if (v === undefined) {
            return new Vertex(key)
        } else {
            return v
        }
    }

    deleteVertex(key: string) {
        this.vertices.delete(key)
    }
    
    vertexForEach(callback: (key: string, v: Vertex) => void) {
        for(const [key, vertex] of this.vertices.entries()) {
            callback(key, vertex)
        }
    }


    // https://obsidian.md/
    writeObsidianCompatibleMarkdown(folderPath: string) {
        for (const [key, vertex] of this.vertices.entries()) {
            fs.writeFileSync(`${folderPath}/${key}.md`, vertex.getEdges().map(e => `[[${e.getValue()}]]`).join("\n"))
        }
    }



    /**
     * 
     * 
     * 
     * 
     * 
     * 
     */


    // handles create and update
    insertEdge(e: Edge) {
        this.edges.set(e.createEdgeKey(), e)
    }

    getEdge(key: string) {
        return this.edges.get(key)
    }

    deleteEdge(key: string) {
        this.edges.delete(key)
    }
}