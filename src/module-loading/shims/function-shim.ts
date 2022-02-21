
// Node ---- Operation ----
//             L Gizmo
//                L getState() -> store it in cable
//                L render() 
//                L onMouseAtCertainPosition() -> 
//                L  
// 

import { State } from "../../nodes-canvas/model/state";
import { FN, JSLoading } from "../helpers/js-loading";
import { Type, VariableShim } from "./variable-shim";

/**
 * Offers a blueprint for creating a new node
 * It wraps a function, and delivers some useful information
 * This is needed, so we can reason about the functionalities of operations
 * Not the same as a Node : Multiple Different Nodes will point to the same FunctionBlueprint
 */
export class FunctionShim {

    public nameLower: string;

    constructor(
        public readonly func: Function,
        public readonly name: string,
        public readonly path: string[],
    
        public readonly ins: VariableShim[],
        public readonly outs: VariableShim[]
        ) {
            this.nameLower = name.toLowerCase();
        }

    get inCount() {
        return this.ins.length;
    }

    get outCount() {
        return this.ins.length;
    }

    static newFromFunction(func: Function, name="function", namespace="custom") {

        let inCount = JSLoading.countInputsFromRawFunction(func);
        let outCount = JSLoading.countOutputsFromRawFunction(func);

        // with raw js, there is no way of ensuring type savety
        let ins: VariableShim[] = [];
        for (let i = 0 ; i < inCount; i++) ins.push()
        let outs: VariableShim[] = [];
        for (let i = 0 ; i < outCount; i++) outs.push(VariableShim.new(`out${i}`, Type.any))

        return new FunctionShim(func, name, [namespace, name], ins, outs);
    }

    log() {
        console.log(`name: ${this.name}`);
        console.log(`path: ${this.path}`);
        console.log(`inputs: ${this.inCount}`);
        console.log(`outputs: ${this.outCount}`);    
    }

    toJson() {
        return {
            name: this.name,
            path: this.path,
        }
    }
}