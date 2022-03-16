// https://www.sheshbabu.com/posts/rust-for-javascript-developers-pattern-matching-and-enums/
// *sigh*, if only we could write something like this. 
// ```
// enum TypeKind {
//     Any,
//     Boolean,
//     Number,
//     String,
//     List(TypeKind),
//     Tuple(TypeKind[]),
// }
// ``` 
// thats really all we need. Now, we need to do weird things

import { TypeShim } from "../shims/type-shim";

// export type BufferLike = Type.IntBuffer | Type.UntBuffer | Type.ByteBuffer | Type.FloatBuffer | Type.DoubleBuffer;

// export type MatrixLike = Type.IntMatrix | Type.UntMatrix | Type.ByteMatrix | Type.FloatMatrix | Type.DoubleMatrix;

// export type GeometryLike = Type.Vector3 | Type.MultiVector3 | Type.Line3 | Type.MultiLine3 | Type.Mesh;


export enum Type {
    
    // basics
    void,
    any,
    boolean,
    number,
    string,

    // collections 
    List, // TODO remove this? its not a type, its like a 'type of types'
    Tuple,
    Object,

    // weirds
    Union,
    Reference, // this is how foreign types / objects are represented
    Promise,

    // buffers 
    U8Buffer,  // Vec<u8>  // Byte
    I8Buffer,  // Vec<u8>  // (leave out)
    U16Buffer, // Vec<u8>  // (leave out)
    I16Buffer, // Vec<u8>  // (leave out)
    U32Buffer, // Vec<u32> // Unt
    I32Buffer, // Vec<i32> // int
    F32Buffer, // Vec<f32> // Float
    F64Buffer, // Vec<f64> // Double

    // matrices
    // ByteMatrix,
    // UntMatrix, 
    // IntMatrix, 
    // FloatMatrix,
    // DoubleMatrix,
}

export function getBufferTypes() {
    return [
        TypeShim.new("Uint8Array", Type.U8Buffer),
        TypeShim.new("Int8Array", Type.I8Buffer),
        TypeShim.new("Uint16Array", Type.U16Buffer),
        TypeShim.new("Int16Array", Type.I16Buffer),
        TypeShim.new("Uint32Array", Type.U32Buffer),
        TypeShim.new("Int32Array", Type.I32Buffer),
        TypeShim.new("Float32Array", Type.F32Buffer),
        TypeShim.new("Float64Array", Type.F64Buffer),
    ]
}
