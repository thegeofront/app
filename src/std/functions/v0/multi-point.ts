// export interface MultiPoint2 {
//     trait: "multi-point-2",
//     data: Array<number>,
// }

import { Debug } from "../../../../../engine/src/lib";
import { JsType } from "../../../modules/types/type";
import { shim } from "../../std-system";
import { ListSetWidget } from "../../widgets/data/list-widget";
import { Point } from "./point";

// function randomPoints(rng: any, domain: [number, number, number], count: number) {

// }


export class MultiPoint {
    
    constructor(
        public data: number[],
    ) {}

    static fromPoints(points: Point[]) {
        return new MultiPoint(linearize(points));
    }

    static fromArray(array: number[]) {
        return new MultiPoint(array);
    }

    static toPoints(mp: MultiPoint) {
        return raise(mp.data);
    }

    static toArray(mp: MultiPoint) {
        return mp.data;
    }

    static readonly Functions = [
        shim(MultiPoint.fromPoints, "MultiPoint", "", [JsType.List], [JsType.Object]),
        shim(MultiPoint.fromArray, "MultiPoint from array", "", [JsType.List], [JsType.Object]),
        shim(MultiPoint.toPoints, "iterate", "", [JsType.Object], [JsType.List]),
        shim(MultiPoint.toArray, "to array", "", [JsType.Object], [JsType.List])
    ]
}

function linearize(points: Point[]) {
    let DIM = 3;
    let data = new Array(points.length * 3);
    for (let i = 0 ; i < points.length; i++) {
        let p = points[i];
        let pointarray = [p.x, p.y, p.z]
        for (let j = 0; j < DIM; j++) {
            data[i * DIM + j] = pointarray[j]; 
        }
    }
    return data;
}

function raise(data: number[]) : Point[] {
    let DIM = 3;
    if (data.length % DIM != 0) {
        throw new Error("length of data needs to be divisible by " + DIM);
    }
    let count = data.length / DIM;
    let points: Point[] = [];
    for (let i = 0 ; i < count; i++) {
        points[i] = Point.fromArray(data.slice(i * DIM, (i+1) * DIM));
    }
    return points;
}
