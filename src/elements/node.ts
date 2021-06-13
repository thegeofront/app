import { Domain2, MultiVector2, Vector2 } from "../../../engine/src/lib";
import { CTX, NodesController } from "../nodes/nodes-controller";
import { Operation } from "../operations/operation";


/**
 * NOTE: I would like to call this 'Node', but that clashes with the standard library...
 * NOTE: A Chip might share an Operation with other Chips.
 */
export class GeonNode {

    private constructor(
        public gridpos: Vector2, 
        public readonly op: Operation) {}

    static new(gridpos: Vector2, op: Operation) {
        return new GeonNode(gridpos, op);
    }

    run(...args: boolean[]) {
        return this.op.run(...args);
    }

    log() {
        console.log(`chip at ${this.gridpos}`);
        // this.operation.name
        console.log("operation: ")
        this.op.log();
    }

    draw(ctx: CTX, canvas: NodesController) {

        let pos = canvas.toWorld(this.gridpos);
        let rec = Domain2.fromWH(pos.x,pos.y, canvas.size * 2, canvas.size * 2);
        
        ctx.save();

        // draw body
        ctx.translate(pos.x, pos.y);
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#222222';
        let textCenters = shape(ctx, this.op.inputs, this.op.outputs, canvas.size);
        ctx.fill();
        ctx.stroke();

        // draw operation text
        ctx.fillStyle = 'white';
        ctx.font = '20px courier new';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let op_center = textCenters.get(0);
        ctx.fillText(this.op.name, op_center.x, op_center.y);

        // draw input text
        ctx.font = '12px courier new';
        for (let i = 0 ; i < this.op.inputs; i++) {
            let vec = textCenters.get(1 + i);
            ctx.fillText('|', vec.x, vec.y);
        }

        // draw output text
        for (let i = 0 ; i < this.op.outputs; i++) {
            let vec = textCenters.get(1 + this.op.inputs + i);
            ctx.fillText('|', vec.x, vec.y);
        }

        // ctx.fillStyle = '#222222';
        // ctx.fillRect(0, 0, rec.x.size(), rec.y.size());
        // ctx.strokeStyle = '#ffffff';
        // ctx.lineCap = "square";
        // ctx.lineWidth = 1;
        // ctx.strokeRect(0, 0, rec.x.size(), rec.y.size());
        ctx.restore();
    }
}

/**
 * Draw the chip shape
 * returns 
 */
function shape(ctx: CTX, inputs: number, outputs: number, size: number) : MultiVector2 {
    let max = Math.max(inputs, outputs);
    let part = 5;
    let step = size / part;
    let width = max * part;
    
    let cola = 0.5
    let colb = 1;
    let colc = 1.5;
    let cold = 5 + 8.5;
    let cole = 5 + 9;
    let colf = 5 + 9.5;

    let coord = (x: number,y: number) => {
        return Vector2.new(y*step, x*step);
    }
    let moveTo = (x: number, y: number) => {
        ctx.moveTo(y*step, x*step);
    }
    let lineTo = (x: number, y: number) => {
        ctx.lineTo(y*step, x*step);
    }

    // calculate coorindates of input, output, and body centers
    let vecs = MultiVector2.new(inputs + outputs + 1);
    vecs.set(0, coord(width/2, colf/2));

    // top
    moveTo(0.5, cole);
    lineTo(0.5, cold);
    lineTo(0.5, colc);
    lineTo(0.5, colb);

    // draw inputs
    for(let i = 0; i < max; i++) {
        let offset = i * 5;
        if (i < inputs) {

            // store center
            vecs.set(1 + i, coord(offset+ 2.5, colb))

            // draw zig-zag
            lineTo(offset+1  , cola);
            lineTo(offset+4  , cola);
            lineTo(offset+4.5, colb);
            if (i != max-1)
                lineTo(offset+5.5, colb);
        } else {
            // draw straight line
            // lineTo(offset+4.5, colb);
        }
    }

    // bottom
    // lineTo(width-0.5, 4); // colb
    lineTo(width-0.5, 5); // colc
    lineTo(width-0.5, 10); // cold
    // lineTo(width-0.5, 6); // cole

    // draw outputs
    moveTo(0.5, cole);
    for(let i = 0; i < max; i++) {
        let offset = i * 5;
        if (i < outputs) {

            // store center
            vecs.set(1 + inputs + i, coord(offset+ 2.5, cole))

            // draw zig-zag
            lineTo(offset+1  , colf);
            lineTo(offset+4  , colf);
            lineTo(offset+4.5, cole);
            if (i != max-1)
                lineTo(offset+5.5, cole);
        } else {
            // draw straight line
            // lineTo(offset+4.5,cole);
        }
    }
    lineTo(width-0.5, 10); // cold
    return vecs;
}


import * as OPS from "../operations/functions";

function test() {
    let and_operation = Operation.new(OPS.and);
    let not_operation = Operation.new(OPS.not);

    let and_chip = GeonNode.new(Vector2.new(6,10), and_operation);
    let or_chip = GeonNode.new(Vector2.new(1,1), not_operation);

    and_chip.log();
    or_chip.log();
}

test();
