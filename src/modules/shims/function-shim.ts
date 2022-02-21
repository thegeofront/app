
// Node ---- Operation ----
//             L Gizmo
//                L getState() -> store it in cable
//                L render() 
//                L onMouseAtCertainPosition() -> 
//                L  
// 

import { State } from "../../nodes-canvas/model/state";
import { FN, JSLoading } from "../helpers/js-loading";
import { Type, ParameterShim } from "./parameter-shim";

/**
 * Offers a blueprint for creating a new node
 * wrap a function, and delivers some useful information
 * This is needed, so we can reason about the functionalities of operations
 * Not the same as a Node, Because multiple nodes will point to the same FunctionShim
 * 
 */
export class FunctionShim {

    public nameLower: string;

    constructor(
        public readonly name: string,
        public readonly path: string[],
        public readonly func: Function,
        public readonly ins: ParameterShim[],
        public readonly outs: ParameterShim[]
        ) {
        this.nameLower = name.toLowerCase();
    }

    get inCount() {
        return this.ins.length;
    }

    get outCount() {
        return this.outs.length;
    }

    static newFromFunction(func: Function, name="function", namespace="custom") {

        let inCount = JSLoading.countInputsFromRawFunction(func);
        let outCount = JSLoading.countOutputsFromRawFunction(func);

        // with raw js, there is no way of ensuring type savety
        let ins: ParameterShim[] = [];
        for (let i = 0 ; i < inCount; i++) ins.push(ParameterShim.new(`in${i}`, Type.any))
        let outs: ParameterShim[] = [];
        for (let i = 0 ; i < outCount; i++) outs.push(ParameterShim.new(`out${i}`, Type.any))

        return new FunctionShim(name, [namespace, name], func, ins, outs);
    }

    run(inputs: any[]) {
        // console.log()
        return this.func(...inputs);
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