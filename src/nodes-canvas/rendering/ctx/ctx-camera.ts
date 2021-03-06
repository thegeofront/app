import {Domain, Domain2, InputState, Vector2} from "../../../../../engine/src/lib";
import { CTX } from "./ctx-helpers";

/**
 * 2d camera for ctx context
 */
export class CtxCamera {
    
    private scaleRange = Domain.new(0.3, 5)
    public onMouseDown?: (c: Vector2, double: boolean) => void;
    public onMouseUp?: (c: Vector2) => void;
    public onMouseMove?: (c: Vector2) => void;
    public mousePos = Vector2.new();
    public doubleClick = false;

    private constructor(
        private html_canvas: HTMLCanvasElement,
        public pos: Vector2, 
        public scale: number) {
            this.setupEvents() 
        }

    static new(
        html_canvas: HTMLCanvasElement, 
        startPos: Vector2, 
        startScale: number) {
        return new CtxCamera(html_canvas, startPos, startScale);
    }

    setupEvents() {
        window.addEventListener('dblclick', (e) => {
            this.doubleClick = true;
        })
    }

    log() {
        console.log(`camera pos: ${this.pos} scale: ${this.scale}`);
    }

    update(state: InputState) : boolean {
        let redraw = false;
        
        // always store mouse 
        let rect = this.html_canvas.getBoundingClientRect();
        let canvasPos = Vector2.new(rect.x, rect.y);
        
        // console.log(rect);
        // let canvasPos = Vector2.new(Number(this.html_canvas.style.left), Number(this.html_canvas.style.top));
        // console.log(canvasPos);
        let worldPos = this.screenToWorld(state.mousePos.subbed(canvasPos));
        this.mousePos = worldPos;

        // we have to check these things every frame to make dragging consistent

        // clicking down
        if ((state.mouseLeftPressed || this.doubleClick) && this.onMouseDown) {
            this.onMouseDown(worldPos, this.doubleClick);
            if (this.doubleClick && this.onMouseUp) {
                this.onMouseUp(worldPos);    
                this.doubleClick = false;
            }
        }

        // click lift 
        // console.log(state.mouseLeftDown, state.mouseLeftPrev);
        if (!state.mouseLeftDown && state.mouseLeftPrev && this.onMouseUp) {
            this.onMouseUp(worldPos);
        }

        // panning
        if (state.mouseRightDown && (state.mouseDelta.x != 0 || state.mouseDelta.y != 0)) {
            this.pos.sub(state.mouseDelta);
            redraw = true;
        }
      
        // zooming [JF] Lets leave this for later... 
        if (state.mouseScrollDelta != 0) {

            // let zoompoint = this.getCenter();
            // let world1 = this.screenToWorld(zoompoint);
            // this.scale = this.scaleRange.comform(this.scale * (1 - state.mouseScrollDelta));
            // // calculate the new top-left point

            // // thanks to zoomchange, this is now different
            // let world2 = this.screenToWorld(zoompoint);
            // let diff = world2.sub(world1);
            // // this.position.add(diff);


            // this.position = this.position.lerp(zoompoint, scalar / 2);

            redraw = true;
        }
        
        return redraw;
    }

    screenToWorld(sv: Vector2) {
        sv = sv.clone();

        // translate
        sv.add(this.pos);

        // scale
        return sv.scaled(1/this.scale);
    }

    worldToScreen(wv: Vector2) {
        // inv-scale
        wv = wv.clone();
        
        wv.scale(this.scale)
        // inv-translate
        return wv.sub(this.pos)
    }

    getCenter() {
        let box = this.getBox();
        return box.elevate(Vector2.new(0.5,0.5));
    }

    moveCtxToState(ctx: CTX) {
        ctx.translate(-this.pos.x, -this.pos.y)
        ctx.scale(this.scale, this.scale);
    }

    getBox() {
        let width = this.html_canvas.width;
        let height = this.html_canvas.height;
        return Domain2.fromWH(this.pos.x, this.pos.y, width, height);
    }
}