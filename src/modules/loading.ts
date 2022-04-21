import { Catalogue } from "./catalogue";
import { IO } from "../nodes-canvas/util/io";
import { ModuleShim } from "./shims/module-shim";
import { WasmLoading } from "./helpers/wasm-loading";
import { DTSLoading } from "./helpers/dts-loading";
import { JSLoading } from "./helpers/js-loading";
import ts from "typescript";
import { TypeShim } from "./shims/type-shim";
import { Misc } from "../nodes-canvas/util/misc";
import { getStandardTypesAsDict } from "./types/registry";
import { URL } from "../util/url";
import { Debug } from "../../../engine/src/lib";

export namespace ModuleLoading {
    
    /** 
     * - read the json
     * - create libraries
     * - put them in a Catalogue
     * */ 
    export async function loadModulesToCatalogue(stdPath: string) {

        // get the catalogue, fill it with standard widgets & types
        let catalogue = Catalogue.newFromWidgets();   
        catalogue.types = getStandardTypesAsDict();

        let json = await IO.fetchJson(stdPath);
  
        const base = URL.getBase();

        // load new modules 
        for (let config of json.std) {
            const icon = config.icon;
            const nickname = config.nickname;
            const jsPath = config.path + config.filename + ".js";
            const dtsPath = config.path + config.filename + ".d.ts";
            
            const {js, syntaxTree} = await loadModule(jsPath, dtsPath, config.filename);
            const {module, types} = await loadShimModule(js, jsPath, syntaxTree, nickname, icon, catalogue.types);
            catalogue.addLibrary(module);
            catalogue.types = types;
        }

        // load wasm modules 
        for (let config of json.wasm) {
            let {module, types} = await loadWasmModule(config, catalogue.types);
            if (module) {
                catalogue.addLibrary(module);
                catalogue.types = types!;
            } else {
                Debug.warn("could not load module: " + config.nickname + " ...");
            }
        }

        return catalogue
    }


    export async function loadWasmModule(config: any, types = new Map<string, TypeShim>()) {

        const icon = config.icon;
        const nickname = config.nickname;
        let base = "";

        // this is a dumb, error-prone hack
        if (!config.path.includes("http")) {
            base = URL.getBase();
        }

        const jsPath = base + config.path + config.filename + ".js";
        const dtsPath = base + config.path + config.filename + ".d.ts";
        const wasmPath = base + config.path + config.filename + "_bg.wasm";
        
        // TODO expand on this
        const typeBlacklist = Misc.setFromList(["InitInput", "InitOutput"]);
        const funcBlacklist = Misc.setFromList(["init", "free"]);

        const res = await WasmLoading.moduleFromWasmPack(jsPath, dtsPath, wasmPath).catch((e) => {
            Debug.warn(e);
            return undefined;
        });

        if (!res) {
            return {module: undefined, types: undefined};
        }

        const {js, syntaxTree} = res;

        types = DTSLoading.extractTypeDeclarations(syntaxTree, types, typeBlacklist);
        // console.log(types);
        
        let shims = DTSLoading.extractFunctionShims(syntaxTree, nickname, js, types, funcBlacklist);
        const module = ModuleShim.new(nickname, icon, jsPath, js, shims, []);

        return {module, types};
    }


    export async function loadModule(jsPath: string, dtsPath: string, dtsName: string) {
        // console.log("loading", jsPath, "and", dtsPath)
        let js = await JSLoading.loadModule(jsPath);
        let syntaxTree = await DTSLoading.load(dtsPath, dtsName, {});

        return {js, syntaxTree};
    }

    /**
     * The loading procedure of one module
     */
    export async function loadShimModule(
        jsModule: any, 
        jsPath: string, 
        syntaxTree: ts.SourceFile, 
        nickname: string, 
        icon: string, 
        types= new Map<string, TypeShim>(), 
        ) {
        
        types = DTSLoading.extractTypeDeclarations(syntaxTree, types);
        let shims = DTSLoading.extractFunctionShims(syntaxTree, nickname, jsModule, types);

        // use the source map to find types
        
        // use the source map to find functions 

        // 

        // console.log(libObj, sourceMap);

        const module = ModuleShim.new(nickname, icon, jsPath, jsModule, shims, []);

        return {module, types};
    }
}