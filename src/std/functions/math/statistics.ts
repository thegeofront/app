import { FunctionShim } from "../../../modules/shims/function-shim";
import { MapTree } from "../../../util/maptree";
import { Divider, make } from "../../std-system";

export const StatFunctions = [
    make(average)
];

function average(list: number[]) {
    let sum = 0
    let count = list.length;
    for (let i = 0 ; i < count; i++) {
        sum += list[i];
    }
    return sum / count;
}