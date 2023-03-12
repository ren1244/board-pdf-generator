import { PdfDict } from './pdf-core.js';

export default function goBoard(pdf, pageW, pageH, n, gridW, gridH, diameter) {
    // 
    const nm1 = n - 1;
    // 放大倍率
    const scale = 72 / 254;
    // 線寬 1 mm
    const strokW = 10; // 1mm
    // 直徑 4 mm
    const r = diameter * 5;
    // 左下角座標
    const x0 = (pageW - gridW * nm1) * 36 / 25.4;
    const y0 = (pageH - gridH * nm1) * 36 / 25.4;
    const mask = n < 19 ? 341 : 0x1ff;
    const starPos = [3, nm1 / 2, nm1 - 3];
    gridW *= 10;
    gridH *= 10;

    pdf.addPage(pageW, pageH);
    pdf.addResource('XObject', 'STAR', createXObject(r));
    let s = [`q 0 0 0 1 K 0 0 0 1 k ${scale} 0 0 ${scale} ${x0} ${y0} cm ${strokW} w`];
    for (let k = 1; k < nm1; ++k) {
        s.push(`0 ${k * gridH} m ${nm1 * gridW} ${k * gridH} l`);
        s.push(`${k * gridW} 0 m ${k * gridW} ${nm1 * gridH} l`);
    }
    s.push(`0 0 ${nm1 * gridW} ${nm1 * gridH} re S`);
    for (let k = 0; k < 9; ++k) {
        if (1 << k & mask) {
            s.push(`q 1 0 0 1 ${starPos[k % 3] * gridW} ${starPos[k / 3 | 0] * gridH} cm /STAR Do Q`);
        }
    }
    s.push(`Q`);
    pdf.write(s.join(' '));
}

function createXObject(r) {
    let l = (r * 4 / 3 * Math.tan(Math.PI / 8)).toFixed(5);
    let s = [
        `${r} 0 m ${r} ${l} ${l} ${r} 0 ${r} c`,
        `-${l} ${r} -${r} ${l} -${r} 0 c`,
        `-${r} -${l} -${l} -${r} 0 -${r} c`,
        `${l} -${r} ${r} -${l} ${r} 0 c`,
        `f`,
    ];

    return new PdfDict({
        Type: '/XObject',
        Subtype: '/Form',
        BBox: [-r - 1, -r - 1, r + 2, r + 2],
        Resources: '<< /ProcSet [ /PDF ] >>'
    }, s.join(' '));
}
