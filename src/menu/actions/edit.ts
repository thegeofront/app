import { BillboardShader, Key } from "../../../../engine/src/lib";
import { PayloadEventType } from "../../html/payload-event";
import { HTML } from "../../html/util";
import { NodesCanvas } from "../../nodes-canvas/nodes-canvas";
import { MenuAction } from "../logic/menu-action";
import { MenuDivider } from "../logic/menu-divider";
import { MenuItem } from "../logic/menu-item";
import { MenuList } from "../logic/menu-list";

export function getEditActions(context: NodesCanvas) : MenuItem[] {
    
    // HTML.listen(DelayedPasteEvent, (str) => context.onPaste(str));
    
    return [
        MenuAction.new(context, "Undo", undo, [Key.Ctrl, Key.Z]),
        MenuAction.new(context, "Redo", redo, [Key.Ctrl, Key.Y]),
        MenuDivider.new(),
        MenuAction.new(context, "Cut", cut, [Key.Ctrl, Key.X]),
        MenuAction.new(context, "Copy", copy, [Key.Ctrl, Key.C]),
        MenuAction.new(context, "Paste", paste, [Key.Ctrl, Key.V]),
        MenuAction.new(context, "Duplcate", duplicate, [Key.Ctrl, Key.D]),
        MenuDivider.new(),
        MenuAction.new(context, "Select all", selectAll, [Key.Ctrl, Key.A]),
    ];
} 


function undo(nodes: NodesCanvas) {
    let change = nodes.graphHistory.undo(); 
}


function redo(nodes: NodesCanvas) {
    let change = nodes.graphHistory.redo(); 
}


async function cut(nodes: NodesCanvas) {
    let str = nodes.onCut();
    navigator.clipboard.writeText(str);
}


async function copy(nodes: NodesCanvas) {
    let str = nodes.onCopy();
    navigator.clipboard.writeText(str);
}


async function paste(nodes: NodesCanvas) {
    // console.log("pastypasty");
    let str: string;
    try {
        str = await navigator.clipboard.readText();
    } catch (e) {
        // for (let item of items) {
        //     if (!item.types.includes("text/plain")) return;
        //     let data = await item.getType("image/png");
        //     let text = await data.text();
        //     console.log("pasted the following text: ", text);
        //     nodes.onPaste(text);
        // }
        alert("Pasting works different in firefox, not yet implemented...")
        return;
    }

    nodes.onPaste(str);
}


function duplicate(nodes: NodesCanvas) {
    nodes.onDuplicate();
}


function selectAll(nodes: NodesCanvas) {
    nodes.onSelectAll();
}


// function something() {
//     navigator.permissions.query({ name: "clipboard-read" }).then((result) => {
//         if (result.state == "granted" || result.state == "prompt") {
//           navigator.clipboard.read().then((data) => {
//             for (let i = 0; i < data.length; i++) {
//               if (!data[i].types.includes("image/png")) {
//                 alert("Clipboard contains non-image data. Unable to access it.");
//               } else {
//                 data[i].getType("image/png").then((blob) => {
//                   imgElem.src = URL.createObjectURL(blob);
//                 });
//               }
//             }
//           });
//         }
//       });
// }

// const DelayedPasteEvent = new PayloadEventType<string>("delayedpasteevent");

// /**
//  * To deal with dumb browser issues, handle a normal clipboard event
//  */
//  function hack() {

//     document.onpaste = (e: ClipboardEvent) => {
//         console.log("is this a race?");
//         if (!e.clipboardData) {
//             // alert("I would like a string, please");
//             return;
//         }
//         if (e.clipboardData.items.length != 1) {
//             // alert("I would like just one string, please");
//             return;
//         }
//         e.clipboardData.items[0].getAsString((str) => {
//             HTML.dispatch(DelayedPasteEvent, str);
//         });
//     }
// }

// hack()

// let clip: string = "";