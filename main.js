import { PdfDict } from './pdf-core.js';
import Pdf from './pdf.js';

const pageW = 297;
const pageH = 420;
const edge = 33;

// 放大倍率
const scale = edge * 72 / 25.4;
const strokW = 2 / scale;
const x0 = (pageW - edge * 8) * 36 / 25.4;
const y0 = (pageH - edge * 9) * 36 / 25.4;
const y1 = (pageH + edge * 9) * 36 / 25.4;

const pdf = new Pdf;
pdf.addPage(pageW, pageH);

const tmp = [
    '0.08 0.25 m 0.08 0.08 l 0.25 0.08 l',       //(一)
    '0.08 -0.25 m 0.08 -0.08 l 0.25 -0.08 l',    //(四)
    '-0.08 0.25 m -0.08 0.08 l -0.25 0.08 l',    //(二)
    '-0.08 -0.25 m -0.08 -0.08 l -0.25 -0.08 l', //(三)
];

let s = [`q ${strokW.toFixed(5)} w`];
for (let x = 1; x < 8; ++x) {
    s.push(`${x} 0 m ${x} 4 l`);
}
for (let y = 1; y < 5; ++y) {
    s.push(`0 ${y} m 8 ${y} l`);
}
s.push(`3 0 m 5 2 l 5 0 m 3 2 l`);
s.push(`0 0 8 9 re S ${(strokW * 1.5).toFixed(5)} w -0.08 -0.08 8.16 9.16 re S Q`);
s.push(`q 1 0 0 1 2 3 cm ${strokW.toFixed(5)} w ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 4 3 cm ${strokW.toFixed(5)} w ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 6 3 cm ${strokW.toFixed(5)} w ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 1 2 cm ${strokW.toFixed(5)} w ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 7 2 cm ${strokW.toFixed(5)} w ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 0 3 cm ${strokW.toFixed(5)} w ${tmp.slice(0, 2).join(' ')} S Q`);
s.push(`q 1 0 0 1 8 3 cm ${strokW.toFixed(5)} w ${tmp.slice(2).join(' ')} S Q`);

pdf.addResource('XObject', 'FX1', new PdfDict({
    Type: '/XObject',
    Subtype: '/Form',
    BBox: [-1, -1, 9, 10],
    Resources: '<< /ProcSet [ /PDF ] >>'
}, s.join(' ')));

pdf.write([
    '0 0 0 1 K 0 0 0 1 k',
    `q ${scale.toFixed(5)} 0 0 ${scale.toFixed(5)} ${x0.toFixed(5)} ${y0.toFixed(5)} cm /FX1 Do Q`,
    `q ${scale.toFixed(5)} 0 0 ${(-scale).toFixed(5)} ${x0.toFixed(5)} ${y1.toFixed(5)} cm /FX1 Do Q`,
].join(' '));

//輸出結果
let arr = pdf.output('array');

//設定到 iframe 可預覽 pdf
document.querySelector('iframe').src = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
document.querySelector('pre').textContent = new TextDecoder().decode(arr);
