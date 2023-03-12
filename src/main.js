import Pdf from './pdf.js';
import zhChess from './zh-chess.js';
import chess from './chess.js';
import goBoard from './go.js';

const pdf = new Pdf;

zhChess(pdf, 297, 420, 33);
chess(pdf, 297, 420, 35);
goBoard(pdf, 297, 420, 13, 23, 24, 5);

// // 標準日式棋盤
// goBoard(pdf, 424.2, 454.5, 19, 22, 23.7, 4);

//輸出結果
let arr = pdf.output('array');

//設定到 iframe 可預覽 pdf
document.querySelector('iframe').src = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
document.querySelector('pre').textContent = new TextDecoder().decode(arr);
