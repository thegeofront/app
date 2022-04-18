import { FunctionShim } from "../modules/shims/function-shim";
import { TypeShim } from "../modules/shims/type-shim";
import { Type } from "../modules/types/type";
import { GFTypes } from "./geofront-types";
import { MapTree } from "./maptree";

export type Divider = "divider";

export type STDTree = MapTree<FunctionShim | Divider>;

export type ArrayTree<T> = Array<ArrayTree<T>> | T;

/**
 * Shorthander for quickly making a functionshim
 */
export function make(fn: Function) : [string, FunctionShim ] {
    return [fn.name, FunctionShim.newFromFunction(fn)];
}


/**
 * Shorthander for quickly making a functionshim
 */
export function func(name: string, fn: Function) : [string, FunctionShim ] {
    return [name, FunctionShim.newFromFunction(fn)];
}



export function shim(
    fn: Function, 
    name: string, 
    description: string, 
    ins: Type[] = [], 
    outs: Type[] = []) : [string, FunctionShim ] 
    {
    let inTypes = ins.map((i) => TypeShim.new(Type[i], i, undefined, []))
    let outTypes = outs.map((o) => TypeShim.new(Type[o], o, undefined, []))
    
    return [name, FunctionShim.new(name, [], fn, inTypes, outTypes)];
}

/**
 * Shorthander for making a divider
 */
export function divider(k="div") : [string, Divider] {
    return [k, "divider"];
} 


/**
 * if this typeshim deserves traits, give them
 */
export function tryApplyGeofrontType(type: TypeShim, availableTypes: Map<GFTypes, TypeShim>) {

    for (let [trait, shim] of availableTypes.entries()) {
        if (type.isAcceptableType(shim)) {
            // console.log(type, "is acceptable to ", Trait[trait]);
            type.traits.push(trait);
        } 
        // else if (shim.isAcceptableType(type)) {
        //     console.log(type, "is reverse acceptable to ", Trait[trait]);
        //     type.traits.push(trait);
        // }
    }

    return type;
}
