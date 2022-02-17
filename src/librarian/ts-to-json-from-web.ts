// /**
//  * Based upon
//  * https://stackoverflow.com/questions/39588436/how-to-parse-typescript-definition-to-json
//  */

// import * as ts from "typescript";

// enum PROPERTY_TYPES {
//     any= 128,
//     boolean= 131,
//     number= 144,
//     string= 147,
// };

// class TSNode {

//     constructor(
//         public name: string, 
//         public type: any,
//         public children: TSNode[]=[]) {
//     }

//     addChildren(name: string, type: any) {
//         let node = new TSNode(name, type);
//         this.children.push(node);
//         return node;
//     }

//     getType() {
//         return this.type;
//     }

//     getObject() {
//         let map = {};

//         //@ts-ignore
//         map[this.name] = this.children.length
//             ? this.children
//                   .map(child => child.getObject())
//                   .reduce((pv, child) => {
//                       for (let key in child) {
//                           if (pv.hasOwnProperty(key) || key in pv) {

//                               //@ts-ignore
//                               Object.assign(pv[key], child[key]);
//                           } else {
//                               //@ts-ignore
//                               pv[key] = child[key];
//                           }
//                       }
//                       return pv;
//                   }, {})
//             : this.type;
//         return map;
//     }
// }


// function visit(parent: any, node: any) {

//     switch (node.kind) {
//         case ts.SyntaxKind.ModuleDeclaration:
//             let moduleName = node.name.text;
//             ts.forEachChild(node, visit(parent.addChildren(moduleName)));
//             break;
//         case ts.SyntaxKind.ModuleBlock:
//             ts.forEachChild(node, visit(parent));
//             break;
//         case ts.SyntaxKind.InterfaceDeclaration:
//             let interfaceName = node.name.text;
//             parent[interfaceName] = {};
//             // console.log('interface');
//             ts.forEachChild(node, visit(parent.addChildren(interfaceName)));
//             break;
//         case ts.SyntaxKind.PropertySignature:
//             let propertyName = node.name;
//             let propertyType = node.type;
//             let arrayDeep = 0;
//             let realPropertyName =
//                 'string' !== typeof propertyName && 'text' in propertyName
//                     ? propertyName.text
//                     : propertyName;
//             while (propertyType.kind === ts.SyntaxKind.ArrayType) {
//                 arrayDeep++;
//                 propertyType = propertyType.elementType;
//             }
//             if (propertyType.kind === ts.SyntaxKind.TypeReference) {
//                 let realPropertyType = propertyType.typeName;
//                 parent.addChildren(
//                     realPropertyName,
//                     'Array<'.repeat(arrayDeep) +
//                         (realPropertyType.kind === ts.SyntaxKind.QualifiedName
//                             ? realPropertyType.getText()
//                             : 'text' in realPropertyType
//                               ? realPropertyType.text
//                               : realPropertyType) +
//                         '>'.repeat(arrayDeep)
//                 );
//             } else {
//                 for (let type in PROPERTY_TYPES) {
//                     if (propertyType.kind === PROPERTY_TYPES[type]) {
//                         parent.addChildren(realPropertyName, type);
//                         break;
//                     }
//                 }
//             }
//             break;
//         default:
//     }
// };

// export function tsToJson(filename: string, options: any = {}) {
//     const ROOT_NAME = 'root';
//     const node = new TSNode(ROOT_NAME, {});

//     let program = ts.createProgram([filename], options);
//     let checker = program.getTypeChecker();
//     let sourceFile = program.getSourceFiles()[1];

//     ts.forEachChild(sourceFile, visit(node));

//     return node.getObject()[ROOT_NAME];
// };