import { Blueprint } from "../graph/blueprint";
import { Widget } from "../graph/widget";
import { CoreType } from "../operations/catalogue";
import { BlueprintLibrary } from "../operations/module";
import { DomWriter } from "../util/dom-writer";
import { MenuContent } from "./category";
import { Catalogue } from "./../operations/catalogue";

export class MenuContentOperations implements MenuContent {
    
    constructor(
        private cat: Catalogue, 
        public mod: BlueprintLibrary,
        private canvas: HTMLCanvasElement) {
    }
    
    render(dom: DomWriter): void {
        renderCores(dom, this.mod.operations, this.mod.widgets, this.mod.select.bind(this.mod), this.canvas);
    }
}


function renderCores(d: DomWriter, ops: Blueprint[], wid: Widget[], onPress: (opIdx: string, type: CoreType) => void, canvas: HTMLCanvasElement) {
    
    // operations
    d.add('div', "core-list");
    for (let i = 0 ; i < ops.length; i++) {
        d.addButton("create-node-button m-1", () => {
            onPress(ops[i].name, CoreType.Operation);
            canvas.focus();
        }).addText(ops[i].name)
        d.up().up();
    }

    // gizmo's
    for (let i = 0 ; i < wid.length; i++) {
        d.addDiv("create-gizmo-button-wrapper");
        d.addButton("button", () => {
            onPress(wid[i].name, CoreType.Widget);
            canvas.focus();
        }).addText(wid[i].name);
        d.up().up().up();
    }   
    d.up();
    return d;
}