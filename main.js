import Pdf from './pdf.js';
import zhChess from './zh-chess.js';

const pdf = new Pdf;
zhChess(pdf, 297, 420, 33);

//輸出結果
let arr = pdf.output('array');

//設定到 iframe 可預覽 pdf
document.querySelector('iframe').src = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
document.querySelector('pre').textContent = new TextDecoder().decode(arr);
