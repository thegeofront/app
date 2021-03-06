import { Parameter } from "../../../../engine/src/lib";
import { Compose } from "../../html/util";
import { NodesCanvas } from "../../nodes-canvas/nodes-canvas";
import { MenuMaker } from "../util/menu-maker";

export function makeCanvasMenu(nodes: NodesCanvas) {
    let elements = [
        MenuMaker.enumerate(
            "Zoom", 
            ["16", "24", "32", "48"], 
            nodes.getZoom().toString(), 
            (val) => {nodes.setZoom(Number(val))}),
        MenuMaker.toggle("preview selection", nodes.settings.previewSelection, () => {nodes.settings.previewSelection = !nodes.settings.previewSelection; nodes.onSelectionChange();}),
        MenuMaker.slider(Parameter.new("setting", 1, 0, 5,0.5), (p) => {console.log(p.get())}),
    ]
    let html = Compose.html`
    <details>
        <summary><b></b></summary>
        ${elements}
    </details>
    `;
    return [html];
}
