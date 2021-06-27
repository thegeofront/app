
// Node ---- Operation ----
//             L Gizmo
//                L getState() -> store it in cable
//                L render() 
//                L onMouseAtCertainPosition() -> 
//                L  
// 

import { NodeCore } from "../graph/node-core";



export type FN = (...args: boolean[]) => boolean[]

/**
 * Wraps a function, and delivers some useful information
 * This is needed, so we can reason about the functionalities of chips
 * Not the same as a Node : Multiple Different Nodes will point to the same Operations
 */
export class OperationCore implements NodeCore {

    private constructor(
        private func: FN,
        public readonly name: string,
        public readonly inputs: number, 
        public readonly outputs: number) {}

    static new(func: FN) {
        let inCount = OperationCore.countInputs(func);
        let outCount = OperationCore.countOutputs(func);
        let name = func.name;
        return new OperationCore(func, name, inCount, outCount);
    }

    run(...args: boolean[]) {
        return this.func(...args); 
    }

    log() {
        console.log(`this: ${this.func}`);
        console.log(`name: ${this.func.name}`);
        console.log(`inputs: ${this.inputs}`);
        console.log(`outputs: ${this.outputs}`);    
    }

    // ---- util

    static countInputs(operation: FN) {
        return operation.length;
    }

    static countOutputs(operation: FN) {
        // HACK: its hard to determine the number of inputs, so im directly reading the string of the operation, 
        // and derriving it from the number of comma's found in the return statement.
        // this could create some nasty unforseen side effects...
        let getOutput = /return.*(\[.*\]).*/
        let match = getOutput.exec(operation.toString()) || "";
        let output = match[1];
        if (output == "[]") {
            return 0;
        }

        let count = output.split(',').length;
        
        return count;
    }
}