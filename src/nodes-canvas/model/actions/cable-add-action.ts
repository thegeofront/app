import { NodesGraph } from "../graph";
import { Action } from "../action";
import { Socket } from "../socket";

export class CableAddAction implements Action {

    constructor(
        public from: Socket,
        public to: Socket,
    ) {}

    do(graph: NodesGraph) {
        graph.addConnection(this.from, this.to);
    }
    
    undo(graph: NodesGraph) {
        graph.removeConnection(this.from, this.to)
    }
}

