import { PdfDict } from './pdf-core.js';
import fmtstr from './fmt-string.js';

const scale = 32;
const scale2 = scale / 4; //圓半徑

export default function jumpBoard(pdf, pageW, pageH, edge) {
    const pw = pageW / 25.4 * 72;
    const ph = pageH / 25.4 * 72;

    pdf.addPage(pageW, pageH);
    registryCircle(pdf);
    registryPart(pdf);
    registryBackground(pdf);
    let s = [];
    let colors = ['0.969 0.965 0.098 rg', '0.984 0.059 0.047 rg', '0.086 0.569 0.2 rg'];
    const t = edge / 25.4 * 72 / scale;
    for (let i = 0; i < 6; ++i) {
        const theta = i * Math.PI / 3;
        const sv = Math.sin(theta) * t;
        const cv = Math.cos(theta) * t;
        s.push(fmtstr('q ' + colors[i % 3] + ' {} {} {} {} {} {} cm /BACK Do Q', cv, sv, -sv, cv, pw / 2, ph / 2));
    }
    for (let i = 0; i < 6; ++i) {
        const theta = i * Math.PI / 3;
        const sv = Math.sin(theta) * t;
        const cv = Math.cos(theta) * t;
        s.push(fmtstr('q ' + colors[i % 3] + ' {} {} {} {} {} {} cm /PART1 Do Q', cv, sv, -sv, cv, pw / 2, ph / 2));
    }
    s.push(fmtstr('q {} w {} 0 0 {} {} {} cm /CIRC Do Q', 1 / scale2, scale2 * t, scale2 * t, pw / 2, ph / 2));

    pdf.write(s.join(' '));
}

function registryCircle(pdf) {
    let xobj = pdf.getResource('XObject', 'CIRC');
    if (!xobj) {
        const r = 1;
        let l = r * 4 / 3 * Math.tan(Math.PI / 8);
        let s = [
            fmtstr('{} 0 m {} {} {} {} 0 {} c', r, r, l, l, r, r),
            fmtstr('{} {} {} {} {} 0 c', -l, r, -r, l, -r),
            fmtstr('{} {} {} {} 0 {} c', -r, -l, -l, -r, -r),
            fmtstr('{} {} {} {} {} 0 c', l, -r, r, -l, r),
            `S`,
        ];
        xobj = new PdfDict({
            Type: '/XObject',
            Subtype: '/Form',
            BBox: fmtstr('[ {} {} {} {} ]', -r - 1, -r - 1, r + 2, r + 2),
            Resources: '<< /ProcSet [ /PDF ] >>'
        }, s.join(' '));
        pdf.addResource('XObject', 'CIRC', xobj);
    }
    return xobj;
}

function getCirclePath(r, x, y) {
    let l = r * 4 / 3 * Math.tan(Math.PI / 8);
    let s = [
        fmtstr('{} {} m {} {} {} {} {} {} c', r + x, y, r + x, l + y, l + x, r + y, x, r + y),
        fmtstr('{} {} {} {} {} {} c', -l + x, r + y, -r + x, l + y, -r + x, 0 + y),
        fmtstr('{} {} {} {} {} {} c', -r + x, -l + y, -l + x, -r + y, 0 + x, -r + y),
        fmtstr('{} {} {} {} {} {} c', l + x, -r + y, r + x, -l + y, r + x, 0 + y),
        `h`,
    ];
    return s.join(' ');
}

function registryPart(pdf) {
    let xobj = pdf.getResource('XObject', 'PART1');
    const mtx = [0.5, Math.sqrt(3) / 2, -0.5, Math.sqrt(3) / 2].map(t => t * scale);
    if (!xobj) {
        let s = [];
        for (let i = 0; i < 5; ++i) {
            drawLine(s, i, 0, i, 4);
            if (i > 0) {
                drawLine(s, 0, i, 4, i);
                drawLine(s, i, 0, 0, i);
                if (i < 4) {
                    drawLine(s, i, 4, 4, i);
                }
            }
        }

        for (let i = 1; i < 5; ++i) {
            for (let j = 0; j < 5; ++j) {
                drawCirc(s, j, i);
            }
        }
        xobj = new PdfDict({
            Type: '/XObject',
            Subtype: '/Form',
            BBox: [-scale * 4, -scale * 2, scale * 4, scale * 12],
            Resources: {
                ProcSet: ['/PDF'],
                XObject: {
                    CIRC: pdf.getResource('XObject', 'CIRC'),
                }
            }
        }, s.join('\n'));
        pdf.addResource('XObject', 'PART1', xobj);
    }
    return xobj;

    function drawLine(arr, x0, y0, x1, y1) {
        arr.push(fmtstr('q [{}] {} d {} {} m {} {} l S Q',
            scale - scale2 * 2, scale * 2 - scale2,
            x0 * mtx[0] + y0 * mtx[2],
            x0 * mtx[1] + y0 * mtx[3],
            x1 * mtx[0] + y1 * mtx[2],
            x1 * mtx[1] + y1 * mtx[3],
        ));
    }

    function drawCirc(arr, x, y) {
        const cx = x * mtx[0] + y * mtx[2];
        const cy = x * mtx[1] + y * mtx[3];
        arr.push(fmtstr('q {} w {} 0 0 {} {} {} cm /CIRC Do Q', 1 / scale2, scale2, scale2, cx, cy));
    }
}

function registryBackground(pdf) {
    let xobj = pdf.getResource('XObject', 'BACK');
    const mtx = [0.5, Math.sqrt(3) / 2, -0.5, Math.sqrt(3) / 2].map(t => t * scale);
    if (!xobj) {
        let s = [];
        s.push('q');
        // 裁切路徑
        s.push(
            fmtstr('{} {} m {} {} l {} {} l W* n',
                4 * mtx[0] + 4 * mtx[2], 4 * mtx[1] + 4 * mtx[3], // 頂點
                4 * mtx[2], 4 * mtx[3], // 左下
                4 * mtx[0], 4 * mtx[1] //右下
            )
        );
        // 矩形色塊
        s.push(
            fmtstr('{} {} {} {} re',
                4 * mtx[2] - scale2, 4 * mtx[3] - scale2,
                4 * mtx[0] - 4 * mtx[2] + scale2 * 2, 4 * mtx[1] + scale2 * 2
            )
        );
        // 圓形
        for (let i = 0; i < 5; ++i) {
            for (let j = 4 - i; j < 5; ++j) {
                let cx = i * mtx[0] + j * mtx[2];
                let cy = i * mtx[1] + j * mtx[3];
                s.push(getCirclePath(scale2, cx, cy));
            }
        }
        s.push('f* Q');
        xobj = new PdfDict({
            Type: '/XObject',
            Subtype: '/Form',
            BBox: [-scale * 4, -scale * 2, scale * 4, scale * 12],
            Resources: {
                ProcSet: ['/PDF']
            }
        }, s.join('\n'));
        pdf.addResource('XObject', 'BACK', xobj);
    }
    return xobj;
}
