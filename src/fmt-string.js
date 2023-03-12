const FIXED_NUM = 5;

export default function fmtstr(fmt, ...arr) {
    fmt = fmt.split('{}');
    if (fmt.length !== arr.length + 1) {
        throw '格式化字串錯誤';
    }
    let s = [], i;
    for (i = 0; i < arr.length; ++i) {
        s.push(fmt[i]);
        let x = arr[i];
        if (typeof x === 'number') {
            x = x.toFixed(FIXED_NUM);
            let pointPos = x.lastIndexOf('.');
            if (pointPos > -1) {
                let zeroPos = x.length;
                while (x.codePointAt(zeroPos - 1) === 48) {
                    --zeroPos;
                }
                if(pointPos + 1 === zeroPos) {
                    --zeroPos;
                }
                x = x.slice(0, zeroPos);
            }
        }
        s.push(x);
    }
    s.push(fmt[i]);
    return s.join('');
}
