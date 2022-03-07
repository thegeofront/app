/**
 * HTML utilities
 * 
 * Notes: 
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw
 */

import { PayloadEventType } from "./payload-event";


export namespace Str {

    /**
     * This passthrough does nothing except syntax highlighting
     */
    export function html(template: TemplateStringsArray, ...args: any[]) {
        return String.raw(template, ...args);
    }

    export function _htmlStrip(template: TemplateStringsArray, ...args: any[]) {
        let map = _trimTemplate(template);
        return String.raw({raw: map}, ...args);
    }

    /**
     *  remove all leading / leftover whitelines and line breaks
     * @param template 
     * @returns 
     */
    export function _trimTemplate(template: TemplateStringsArray) {
        return template.raw.map(s => {
            let frags = s.split(/(\r\n|\n|\r)/gm);
            let trims = frags.map((frag) => frag.trim());
            return trims.join("");
        });
    }

    /**
     * This passthrough does nothing except syntax highlighting
     */
    export function css(template: TemplateStringsArray, ...args: any[]) {
        return String.raw(template, ...args).trim();
    }
}

/**
 * This passthrough function serves as syntax highlighting
 * @deprecated
 */
export function html(template: TemplateStringsArray, ...args: any[]) {
    return Str.html(template, ...args);
}

/**
 * This passthrough does nothing except syntax highlighting
 * @deprecated
 */
export function css(template: TemplateStringsArray, ...args: any[]) {
    return Str.css(template, ...args);
}


export namespace HTML {

    export function dispatch<T>(type: PayloadEventType<T>, payload?: T) {
        let event = new CustomEvent<T>(type.name, {
            detail: payload,
            bubbles: true,
            composed: true,
        });
        document.dispatchEvent(event);
    }

    export function listen<T>(type: PayloadEventType<T>, callback: (payload: T, e: CustomEvent) => void) {
        let listener = (e: CustomEvent) => {
            //@ts-ignore
            callback(e.detail, e);
        }
    
        //@ts-ignore
        document.addEventListener(type.name, listener);
    }
}


export namespace Node {

    /**
     * This prevents us from creating templates over and over again
     */
    const Template = document.createElement("template");

    /**
     * Generate unattached DOM Node from html
     * - This must be attached to something, otherwise it is lost the second time this function is called  
     * - Only returns first root level node
     * - (not technically needed, just promotes cleanliness)
     */
    export function html(template: TemplateStringsArray, ...args: any[]) : Node {
        Template.innerHTML = Str._htmlStrip(template, ...args);
        return Template.content.firstChild!.cloneNode(true);;
        // return temp.content.childNodes;
    }
}


export namespace Template {
    
    export function html(template: TemplateStringsArray, ...args: any[]) {
        const temp = document.createElement("template");
        let str = Str.html(template, ...args);
        temp.innerHTML = str;
        return temp;
    }
}


export namespace Compose {

    const Template = document.createElement("template");

    /**
     * Composes a node from multiple html 
     */
    export function html(template: TemplateStringsArray, ...args: Node[]) : Node {
        
        // create, but for every node: dont insert, instead create replacement token
        const TOKEN = "geon-substitude";
        let raw = Str._trimTemplate(template).join(`<${TOKEN}></${TOKEN}>`);
        Template.innerHTML = raw;
  
        // now substitute those tokens for the real deal
        let tokens = Array.from(Template.content.querySelectorAll(TOKEN));
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            let replacer = args[i];
            token.replaceWith(replacer);
        }  
        
        // and return this template
        return Template.content.firstChild!.cloneNode(true);
    }
}



function test() {

    let someVar = "kaas";
    let something = Compose.html`
    <div>
        ${Node.html`<p>${someVar}</p>`}
        ${Node.html`<p>r frejioerioogierjoerig j</p>`}
        ${Node.html`<p>HENKIEPINKEE</p>`}
    </div>`;

    // DOM.html`<p>r frejioerioogierjoerig j</p>`

    console.log(something);
}

test();