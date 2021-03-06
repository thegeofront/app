import { GeoShaderType, GeoType } from "./type";

/**
 * Go from magic methods to internal logic.
 * Try to exclude the usage of magic methods to only this namespace.
 */
export namespace PluginConversion {

    export function isTyped(data: any) {
        try {
            return data.constructor.gf_has_trait_typed();
        } catch {
            return false;
        }
    }

    export function isConvertableTo(data: any, type: GeoType) {
        if (!isTyped(data)) return undefined;
        return data.constructor.gf_is_convertable_to(type);
    }

    export function tryConvertTo(data: any, type: GeoType) {
        if (!isTyped(data)) return undefined;
        if (!isConvertableTo(data, type)) return undefined;
        switch(type) {
            case GeoType.Json:
                return toJson(data);
        }
        return undefined;
    }

    export function toJson(data: any) {
        if (!isTyped(data)) return undefined;
        return data.gf_to_json()
    }

    export function fromJson(data: any, val: any) {
        if (!isTyped(data)) return undefined;
        return data.constructor.gf_from_json(val);
    }

    export function getDefault(data: any) {
        if (!isTyped(data)) return undefined;
        return data.constructor.gf_default()
    }

    //////////////////////////////////////////////////////////////// all converters



    ////////////////////////////////////////////////////////////////

    export function isRenderable(data: any) {
        try {
            return data.constructor.gf_has_trait_renderable();
        } catch {
            return false;
        }
    }

    export function getShaderAndBuffers(data: any): {type: GeoShaderType, buffers: any} | undefined {
        if (!isRenderable(data)) return undefined;
        let type = data.constructor.gf_get_shader_type();
        let buffers = data.gf_get_buffers();
        return {type, buffers};
    }

    ////////////////////////////////////////////////////////////////

    export function isDescriptive(data: any) : boolean {
        try {
            return data.constructor.gf_has_trait_descriptive();
        } catch {
            return false;
        }
    }

    export function getDescription(data: any) : Object | undefined {
        if (!isDescriptive(data)) return undefined;
        let description = data.constructor.gf_get_description();
        return description;
    }

    ////////////////////////////////////////////////////////////////

    export function isIterable(data: any) {
        try {
            return data.constructor.gf_has_trait_iterable();
        } catch {
            return false;
        }
    }

    export function getIterableType(data: any) {
        if (!isIterable(data)) return undefined;
        return data.constructor.gf_get_base_type();
    }

    export function collect(data: any) {
        if (!isIterable(data)) return undefined;
        let list = [];
        let count = data.gf_get_length();
        for (let i = 0; i < count; i++) {
            list.push(data.gf_get_item(i));
        }
        return list;
    }

    export function iterate(data: any) {
        throw "TODO!";
    }
}