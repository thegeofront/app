import { Vector2 } from "../../../../../engine/src/lib";
import { NodesGraph } from "../graph";
import { GeonNode } from "../node";
import { State } from "../state";
import { Widget } from "../widget";
import { Action } from "../action";
import { FunctionShim } from "../../../modules/shims/function-shim";

export class NodeAddAction implements Action {

    constructor(
        public process: FunctionShim | Widget,
        public gridPosition: Vector2,
        public initState?: State,
        public key?: string,
    ) {}

    do(graph: NodesGraph) {
        let node = GeonNode.new(this.gridPosition, this.process)!;
        if (node.core instanceof Widget && this.initState) {
            node.core.saveState = this.initState;
        }
        this.key = graph.addNode(node);
    }
    
    undo(graph: NodesGraph) {
        graph.deleteNode(this.key!);
    }
}