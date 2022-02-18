import { FN, FunctionBlueprint } from "./shims/function-shim";
import { GeonNode } from "../nodes-canvas/model/node";
import { Vector2 } from "../../../engine/src/lib";
import { Widget } from "../nodes-canvas/model/widget";
import { ButtonWidget } from "../nodes-canvas/widgets/button-widget";
import { ConsoleWidget } from "../nodes-canvas/widgets/console-widget";
import { LampWidget } from "../nodes-canvas/widgets/lamp-widget";
import { InputWidget } from "../nodes-canvas/widgets/input-widget";
import { ModuleShim } from "./shims/library-shim";
import { ImageWidget } from "../nodes-canvas/widgets/image-widget";

// TODO rename CORE to TYPE
//      rename NODE to INSTANCE maybe


export enum CoreType {
    Operation,
    Widget
}

/**
 * Catalogue containing shim libraries
 * Shims are wrappers of functions and variables. 
 * The canvas can use these to spawn nodes, and draw a graph
 * 
 * In the future, this would make creating a menu easier
 * TODO: Categories
 */
export class Catalogue {

    public selected?: FunctionBlueprint | Widget;

    constructor(public modules: Map<string, ModuleShim>) {}

    static new() : Catalogue {
        return new Catalogue(new Map());
    }

    static newFromWidgets() {
        
        let widgets: Widget[] = [
            ButtonWidget.new(false),
            InputWidget.new("hello world"),
            LampWidget.new(false),
            ConsoleWidget.new(false),
            ImageWidget.new("<image>")
        ]

        let wmap = new Map<string, Widget>();
        for (let w of widgets) {
            wmap.set(w.name, w);
        }

        let cat = Catalogue.new();
        let widMod = ModuleShim.new("widgets", "bi-lightning-charge-fill", "", [], widgets, cat);
        cat.addLibrary(widMod);
        return cat;
    }

    find(lib: string, key: string) {  
        let mod = this.modules.get(lib);
        if (!mod) {
            console.error(`no module is called: ${lib}`);
            return undefined;
        }      
        for (let type of [CoreType.Operation, CoreType.Widget]) {
            let res = this.trySelect(lib, key, type);
            if (res) {
                return res;
            }
        }
        return undefined;
    }

    trySelect(lib: string, key: string, type: CoreType) {
        let mod = this.modules.get(lib);
        if (!mod) {
            console.error(`no module is called: ${lib}`);
            return undefined;
        }
        mod.select(key, type);
        return this.selected;
    }

    selectCore(core: FunctionBlueprint | Widget | undefined) {
        this.selected = core;
    }

    select(lib: string, key: string, type: CoreType) {

        this.modules.get(lib)!.select(key, type);
    }

    deselect() {
        this.selected = undefined;
    }

    /**
     * Spawn an instance of the selected node at a location 
     */
    spawn(gp: Vector2) {
        if (this.selected) {
            return GeonNode.new(gp, this.selected);
        } else {
            return undefined;
        }
    }

    addLibrary(lib: ModuleShim) {
        this.modules.set(lib.name, lib);
        lib.publishGlobally();
    } 
}