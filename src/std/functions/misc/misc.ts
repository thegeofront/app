

export function numberFromBinary(a: boolean,b: boolean,c: boolean,d: boolean,e: boolean,f: boolean,g: boolean,h: boolean) {
    let n = 0;
    let bools = [a,b,c,d,e,f,g,h];
    for (let i = 0 ; i < 8; i++) {
        n += (bools[i] ? 1 : 0) * Math.pow(2, i);
    } 
    return n;
}


export function toBinary(n: number) : [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] {
    let binify = (i: number) => { 
        let val = Math.pow(2, i);
        if (n >= val) { n = n - val;
            return true;
        } else { ;
            return false;
        };
    };
    let h = binify(7);
    let g = binify(6);
    let f = binify(5);
    let e = binify(4);
    let d = binify(3);
    let c = binify(2);
    let b = binify(1);
    let a = binify(0);
    return [a,b,c,d,e,f,g,h];
}