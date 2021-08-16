import { GizmoNode } from "../gizmos/_gizmo";
import { Socket } from "./socket";

export class Variable {

    private constructor(
        public from: Socket, 
        public gizmos: GizmoNode[],
        public _to: Map<string, Socket>) {}

    static new(a: Socket, b: Socket) : Variable {
        if (a.idx < b.idx) {
            return Variable.new(b, a);
        } else {
            let map = new Map<string, Socket>();
            let gizmos: GizmoNode[] = [];
            map.set(b.toString(), b);
            return new Variable(a, gizmos, map);
        }
    }

    get to() {
        return this._to.values();
    }

    add(s: Socket) {
        this._to.set(s.toString(), s);
    }
}