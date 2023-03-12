import fmtstr from './fmt-string.js';

export default function chess(pdf, pageW, pageH, edge) {
    // 放大倍率
    const scale = edge * 72 / 25.4;
    // 線寬 2 pt
    const strokW = 2 / scale;
    // 左下角座標
    const x0 = (pageW - edge * 8) * 36 / 25.4;
    const y0 = (pageH - edge * 8) * 36 / 25.4;

    pdf.addPage(pageW, pageH);
    let s = [fmtstr('q 0 0 0 0.65 K 0 0 0 0.65 k {} 0 0 {} {} {} cm {} w', scale, scale, x0, y0, strokW)];
    for (let y = 0; y < 8; y += 2) {
        for (let x = 0; x < 8; x += 2) {
            s.push(fmtstr('{} {} 1 1 re {} {} 1 1 re', x, y, x+1, y+1));
        }
    }
    s.push(`f 0 0 8 8 re S Q`);
    pdf.write(s.join(' '));
}
