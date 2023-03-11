import { PdfDict } from './pdf-core.js';
import Pdf from './pdf.js';
import font from './font.js';
import { base64_decode } from './base64.js';

const pageW = 297;
const pageH = 420;
const edge = 33;

// 放大倍率
const scale = edge * 72 / 25.4;
const strokW = 2 / scale;
const x0 = (pageW - edge * 8) * 36 / 25.4;
const y0 = (pageH - edge * 9) * 36 / 25.4;

const pdf = new Pdf;
pdf.addPage(pageW, pageH);

let fontObj = new PdfDict({
    Type: '/Font',
    Subtype: '/Type0',
    BaseFont: '/AAAAAA+' + font.fontname,
    Encoding: '/Identity-H',
    DescendantFonts: [],
});

let cidFont = new PdfDict({
    Type: '/Font',
    Subtype: '/CIDFontType2',
    BaseFont: '/AAAAAA+' + font.fontname,
    CIDSystemInfo: {
        Registry: '(Adobe)',
        Ordering: '(Identity)',
        Supplement: 0,
    },
    FontDescriptor: null,
    W: null,
    CIDToGIDMap: '/Identity'
});
fontObj.entries.DescendantFonts.push(cidFont);
let wArr = [];
for (let k in font.charInfo) {
    let x = font.charInfo[k];
    wArr.push(x.w / font.unitsPerEm * 1000);
}
cidFont.entries.W = [1, wArr];

let descriptor = new PdfDict({
    Type: '/FontDescriptor',
    FontName: '/AAAAAA+' + font.fontname,
    Flags: '4',
    FontBBox: font.bbox.map(x => x * 1000 / font.unitsPerEm),
    ItalicAngle: font.italicAngle * 1000 / font.unitsPerEm,
    Ascent: font.ascent * 1000 / font.unitsPerEm,
    Descent: font.descent * 1000 / font.unitsPerEm,
    CapHeight: font.capHeight * 1000 / font.unitsPerEm,
    StemV: 0,
    FontFile2: new PdfDict({}, base64_decode(font.data))
});
cidFont.entries.FontDescriptor = descriptor;

const tmp = [
    '0.08 0.25 m 0.08 0.08 l 0.25 0.08 l',       //(一)
    '0.08 -0.25 m 0.08 -0.08 l 0.25 -0.08 l',    //(四)
    '-0.08 0.25 m -0.08 0.08 l -0.25 0.08 l',    //(二)
    '-0.08 -0.25 m -0.08 -0.08 l -0.25 -0.08 l', //(三)
];

let s = [`q`];
for (let x = 1; x < 8; ++x) {
    s.push(`${x} 0 m ${x} 4 l`);
}
for (let y = 1; y < 5; ++y) {
    s.push(`0 ${y} m 8 ${y} l`);
}
s.push(`3 0 m 5 2 l 5 0 m 3 2 l S`);
s.push(`q 1 0 0 1 2 3 cm ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 4 3 cm ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 6 3 cm ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 1 2 cm ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 7 2 cm ${tmp.join(' ')} S Q`);
s.push(`q 1 0 0 1 0 3 cm ${tmp.slice(0, 2).join(' ')} S Q`);
s.push(`q 1 0 0 1 8 3 cm ${tmp.slice(2).join(' ')} S Q`);
s.push('Q');

pdf.addResource('XObject', 'FX1', new PdfDict({
    Type: '/XObject',
    Subtype: '/Form',
    BBox: [-1, -1, 9, 10],
    Resources: '<< /ProcSet [ /PDF ] >>'
}, s.join(' ')));

pdf.addResource('Font', 'FT1', fontObj);

function convFontInfo(font, ch, sz) {
    return {
        tx: - font.charInfo[ch].w / font.unitsPerEm * sz / 2,
        ty: - (font.bbox[3] + font.bbox[1]) / font.unitsPerEm * sz / 2,
        code: ('0000' + font.charInfo[ch].id).slice(-4),
    };
}

let chInf = [
    convFontInfo(font, '楚', 0.8),
    convFontInfo(font, '河', 0.8),
    convFontInfo(font, '漢', 0.8),
    convFontInfo(font, '界', 0.8),
];

pdf.write([
    `0 0 0 1 K 0 0 0 1 k`,
    `q ${scale.toFixed(5)} 0 0 ${scale.toFixed(5)} ${(x0).toFixed(5)} ${(y0).toFixed(5)} cm ${strokW.toFixed(5)} w`,
    `/FX1 Do q 1 0 0 -1 0 9 cm /FX1 Do Q 0 0 8 9 re S`,
    `q 0 1 -1 0 1.5 4.5 cm BT /FT1 0.8 Tf ${chInf[0].tx} ${chInf[0].ty} Td <${chInf[0].code}> Tj ET Q`,
    `q 0 1 -1 0 2.5 4.5 cm BT /FT1 0.8 Tf ${chInf[1].tx} ${chInf[1].ty} Td <${chInf[1].code}> Tj ET Q`,
    `q 0 -1 1 0 6.5 4.5 cm BT /FT1 0.8 Tf ${chInf[2].tx} ${chInf[2].ty} Td <${chInf[2].code}> Tj ET Q`,
    `q 0 -1 1 0 5.5 4.5 cm BT /FT1 0.8 Tf ${chInf[3].tx} ${chInf[3].ty} Td <${chInf[3].code}> Tj ET Q`,
    'Q'
].join(' '));

//輸出結果
let arr = pdf.output('array');

//設定到 iframe 可預覽 pdf
document.querySelector('iframe').src = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
document.querySelector('pre').textContent = new TextDecoder().decode(arr);
