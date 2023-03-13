import { PdfDict } from './pdf-core.js';
import fmtstr from './fmt-string.js';

let circleFormXObject = null;

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
    if (!circleFormXObject) {
        circleFormXObject = createXObject();
    }
    pdf.addResource('XObject', 'STAR', circleFormXObject);
    let s = [fmtstr('q 0 0 0 1 K 0 0 0 1 k {} 0 0 {} {} {} cm {} w', scale, scale, x0, y0, strokW)];
    for (let k = 1; k < nm1; ++k) {
        s.push(fmtstr('0 {} m {} {} l', k * gridH, nm1 * gridW, k * gridH));
        s.push(fmtstr('{} 0 m {} {} l', k * gridW, k * gridW, nm1 * gridH));
    }
    s.push(fmtstr('0 0 {} {} re S', nm1 * gridW, nm1 * gridH));
    for (let k = 0; k < 9; ++k) {
        if (1 << k & mask) {
            s.push(fmtstr('q {} 0 0 {} {} {} cm /STAR Do Q', r, r, starPos[k % 3] * gridW, starPos[k / 3 | 0] * gridH));
        }
    }
    s.push(`Q`);
    pdf.write(s.join(' '));
}

function createXObject() {
    const r = 1;
    let l = r * 4 / 3 * Math.tan(Math.PI / 8);
    let s = [
        fmtstr('{} 0 m {} {} {} {} 0 {} c', r, r, l, l, r, r),
        fmtstr('{} {} {} {} {} 0 c', -l, r, -r, l, -r),
        fmtstr('{} {} {} {} 0 {} c', -r, -l, -l, -r, -r),
        fmtstr('{} {} {} {} {} 0 c', l, -r, r, -l, r),
        `f`,
    ];

    return new PdfDict({
        Type: '/XObject',
        Subtype: '/Form',
        BBox: fmtstr('[ {} {} {} {} ]', -r - 1, -r - 1, r + 2, r + 2),
        Resources: '<< /ProcSet [ /PDF ] >>'
    }, s.join(' '));
}
