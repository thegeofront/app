import { createRandomGUID } from "../../../../engine/src/lib";
import { Catalogue } from "../blueprints/catalogue";
import { filterMap, mapFromJson, mapToJson } from "../util/serializable";
import { Cable } from "./cable";
import { graphToFunction, jsToGraph } from "./graph-conversion";
import { GeonNode } from "./node";
import { Socket, SocketIdx, SocketSide } from "./socket";
import { State } from "./state";
import { Widget, WidgetSide } from "./widget";

/**
 * A Collection of Nodes, Gizmo's & Cables. 
 * These are doubly linked. (Nodes point to cables, cables point to nodes).
 * The Graph makes sure these links remain correct
 */
export class NodesGraph {

    constructor(
        public nodes: Map<string, GeonNode>, 
        private widgets: Set<string>) {}

    static new(
        nodes = new Map<string, GeonNode>(),
        widgets = new Set<string>()) {
        return new NodesGraph(nodes, widgets);
    }
    
    static fromJs(js: string, catalogue: Catalogue) {
        // TODO
        let graph = jsToGraph(js, catalogue);
        if (!graph) {
            console.warn("could not create graph from js");
            return NodesGraph.new();
        } else {
            return graph;
        }
    }

    static fromSerializedJson(str: string, catalogue: Catalogue) : NodesGraph {

        console.log("from json...")

        let json = JSON.parse(str);
        let graph = NodesGraph.new();
        for (let key in json.nodes) {
            let value = json.nodes[key];
            let lib = value.core.namespace;
            let name = value.core.name;
            let type = value.type;

            let process = catalogue.trySelect(lib, name, type);
            if (!process) {
                console.error(`process: ${lib}, ${name}, ${type} cannot be created. The library is probably missing from this project`);
                continue;
            } 
            let node = GeonNode.fromJson(value, process);
            if (!node) {
                console.error(`process: ${lib}, ${name}, ${type} cannot be created. json data provided is errorous`)
                continue;
            }
            graph.nodes.set(key, node);
            
        }

        catalogue.deselect();

        return graph;
    }

    static toJson(graph: NodesGraph, selection?: string[]) {
        
        let nodes = graph.nodes;
        
        // O(n*n)
        if (selection) {
            nodes = filterMap(nodes, (key) => selection.includes(key));
        }
        
        return {
                nodes: mapToJson(nodes, GeonNode.toJson),
                // cables: mapToJson(cables, Cable.toJson),
        }
    }

    toJs(name: string) {
        return graphToFunction(this, name);
    }

    // ---- True Graph Business 

    /**
     * Calculate the entire graph:
     * - start with the data from input widgets
     * - calculate all operations 
     * - store results in output widgets
     * TODO: build something that can recalculate parts of the graph
     */
    calculate() {

        let cache = new Map<string, State>();
        let orderedNodeKeys = this.kahn();

        let setCache = (key: string, value: State) => {
            // let cable = this.getOutputConnectionsAt(key)!;
            // if (!cable) {
            //     return;
            // }
            cache.set(key, value);
        }

        //start at the widgets (widget keys are the same as the corresponding node)
        for (let key of orderedNodeKeys) {
   
            let node = this.getNode(key)!;

            // calculate in several ways, depending on the node
            if (node.operation) { // A | operation -> pull cache from cables & push cache to cables
                
                let inputs = [];
                for (let cable of node.getCablesAtInput()) { // TODO multiple inputs!! ?
                    inputs.push(cache.get(cable)!);
                }
                let outputs;
                try {
                    outputs = node.operation.run(inputs);
                } catch(e) {
                    let error = e as Error;
                    node.errorState = error.message;
                    console.warn("NODE-ERROR: \n", node.errorState);
                    continue;
                }

                let outCables = node.getCablesAtOutput();
                if (typeof outputs !== "object") {
                    setCache(outCables[0], outputs);
                } else {
                    for (let i = 0 ; i < node.operation.outputs; i++) {
                        setCache(outCables[i], outputs[i]);
                    }
                }
            } else if (node.widget!.side == WidgetSide.Input) { // B | Input Widget -> push cache to cable
                for (let cable of node.getCablesAtOutput()) {
                    setCache(cable, node.widget!.state);
                }
            } else if (node.widget!.side == WidgetSide.Output) { // C | Output Widget -> pull cache from cable
                for (let cable of node.getCablesAtInput()) { // TODO multiple inputs!!
                    node.widget!.run(cache.get(cable)!);
                }
            } else {
                throw new Error("should never happen");
            }
        }
    }

    /**
     * An implementation of kahn's algorithm: 
     * https://en.wikipedia.org/wiki/Topological_sorting
     */
    kahn() {
        // fill starting lists
        let L: string[] = [];
        let S: string[] = [];
        let visitedCables: Set<string> = new Set<string>();

        // use the widgets to identify the starting point
        for (let key of this.widgets) {
            let widget = this.getNode(key)!.widget!;
            if (widget.side != WidgetSide.Input) 
                continue; 
            S.push(key);
        }

        while (true) {

            let hash = S.pop();
            if (hash == undefined) 
                break;
            L.push(hash);

            let node = this.getNode(hash)!;

            // for each node m with an edge e from n to m do
            node.forEachOutputSocket((s: Socket, connections: Socket[]) => {
                let cableHash = s.toString();
                
                // 'remove' edge e from the graph
                if (visitedCables.has(cableHash))
                    return;
                visitedCables.add(cableHash);

                // if m has no other incoming edges then
                // insert m into S
                for (let connection of connections) {
                    let m = connection.hash;
                    let allVisited = true;
                    for (let c of this.getNode(m)!.getCablesAtInput()) {
                        if (!visitedCables.has(c)) {
                            allVisited = false;
                            break;
                        }
                    }
                    if (allVisited) {
                        S.push(m);
                    }
                }
            })
        }

        return L;
    }

    clone() {

    }

    addGraph(other: NodesGraph) { 
        for (let [key, node] of other.nodes) {
            if (this.nodes.has(key)) {
                console.warn("double!!");
                key = createRandomGUID();
                return;   
            } 
            this.nodes.set(key, node);
        }
        return this;
    }

    //////////////////////////////////// Nodes /////////////////////////////////////

    addNode(node: GeonNode, key?: string) {
        if (key == "" || key == undefined) {
            key = createRandomGUID();
        }
        this.nodes.set(key, node);
        if (node.process instanceof Widget) {
            this.widgets.add(key);
        }
        return key;
    }

    getNode(key: string) {
        return this.nodes.get(key);
    }

    deleteNode(hash: string) {
        let node = this.nodes.get(hash)!;

        // pull all connections at connectors
        this.removeAllConnections(hash);

        // remove the widget pointer
        if (node.process instanceof Widget) {
            this.widgets.delete(hash);
        }

        return this.nodes.delete(hash);
    }

    //////////////////////////////////// Connections ///////////////////////////////////////

    getOutputConnectionsAt(local: Socket) : Socket[] {
        if (local.side != SocketSide.Output) throw new Error("NOPE");
        return this.nodes.get(local.hash)!.outputs[local.idx-1];
    }
    
    setOutputConnectionsAt(local: Socket, foreign: Socket[]) {
        if (local.side != SocketSide.Output) throw new Error("NOPE");
        this.nodes.get(local.hash)!.outputs[local.idx-1] = foreign;
    }
    
    addOutputConnectionsAt(local: Socket, foreign: Socket) {
        if (local.side != SocketSide.Output) throw new Error("NOPE");
        this.nodes.get(local.hash)!.outputs[local.idx-1].push(foreign);
    }
    
    removeOutputConnectionsAt(local: Socket, foreign: Socket) {
        if (local.side != SocketSide.Output) throw new Error("NOPE");
        let list = this.nodes.get(local.hash)!.outputs[local.idx-1];
        let index = list.indexOf(foreign);
        if (index == -1) {
            console.warn("foreign socket cannot be removed, because it does not exist");
        }
        list.splice(index, 1);
    }

    getInputConnectionAt(local: Socket) : Socket | undefined {
        if (local.side != SocketSide.Input) throw new Error("NOPE");
        return this.nodes.get(local.hash)!.inputs[(-local.idx) - 1];
    }
    
    setInputConnectionAt(local: Socket, foreign?: Socket) {
        if (local.side != SocketSide.Input) throw new Error("NOPE");
        this.nodes.get(local.hash)!.inputs[(-local.idx) - 1] = foreign;
    }

    removeAllConnections(hash: string) {
        let node = this.getNode(hash)!;
        
        for (let i = 0 ; i < node.process.outputs; i++) {
            let foreigns = node.outputs[i];
            if (!foreigns) continue;
            let local = Socket.fromNode(hash, i, SocketSide.Output);
            
            // remove foreign connection, then my connection
            for (let foreign of foreigns) this.setInputConnectionAt(foreign, undefined)
            this.setOutputConnectionsAt(local, []);
        }
        
        for (let i = 0 ; i < node.process.inputs; i++) {
            let foreign = node.inputs[i];
            if (!foreign) continue;
            let local = Socket.fromNode(hash, i, SocketSide.Input);
            
            // remove foreign connection, then my connection
            this.removeOutputConnectionsAt(foreign, local);
            this.setInputConnectionAt(local, undefined);
        }
    }


    addCableBetween(aHash: string, outputIndex: number, bHash: string, inputIndex: number) {
        let aIndex: SocketIdx = outputIndex + 1;
        let bIndex: SocketIdx = (inputIndex + 1) * -1;
        // console.log({a, outputIndex, b, inputIndex });
        this.addConnection(Socket.new(aHash,aIndex), Socket.new(bHash, bIndex));
    }


    addConnection(local: Socket, foreign: Socket) : boolean {

        // after this local.side == SocketSide.Input, foreign.side == SocketSide.Output
        if (local.side == foreign.side) {
            console.error("errorous connection!");
            return false;
        } else if (local.side != SocketSide.Input || foreign.side != SocketSide.Output) {
            return this.addConnection(foreign, local);   
        }

        // if the input socket already contains something, make sure its emptied correctly
        let localConnection = this.getInputConnectionAt(local);
        let foreignConnections = this.getOutputConnectionsAt(foreign); 
        
        // this cable already exists, remove the connection instead
        if (foreignConnections.includes(local)) {
            console.log("exist already! removing...")
            this.removeConnection(foreign, local);
            return true;
        }

        // if the input node is already, filled, remove whatever is there first
        if (localConnection) {
            this.removeConnection(local, localConnection);
        }

        // finally, add the mutual connection 
        this.setInputConnectionAt(local, foreign);
        this.addOutputConnectionsAt(foreign, local);

        return true;
    }
    
    removeConnection(local: Socket, foreign: Socket) {
        if (local.side == foreign.side) {
            console.error("errorous connection!");
            return false;
        }
        
        if (local.side == SocketSide.Input) {
            this.removeOutputConnectionsAt(foreign, local);
            this.setInputConnectionAt(local, undefined);
        } 

        if (local.side == SocketSide.Output) {
            this.setInputConnectionAt(foreign, undefined);
            this.removeOutputConnectionsAt(local, foreign);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////

    log() {
        console.log("GRAPH");
        console.log("NODES");
        console.log("-----");
        for (let [nkey, node] of this.nodes) {
            console.log(" node");
            console.log(" L key : ", nkey);
            console.log(" L name: ", node.process.name);
            console.log(" L output-connections: ");
            node.forEachOutputSocket((socket, connections) => {
                console.log("    L ", socket.idx, " ----> ");
                connections.forEach(c=> console.log("      L", c.hash, c.idx));
            })

            console.log(" L input-connections: ");
            node.forEachInputSocket((socket, c) => {
                console.log("    L ", socket.idx, " ----> ");
                console.log("      L", c?.hash, c?.idx);
            })
        }
    }
}