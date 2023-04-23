import Pdf from './pdf.js';
import zhChess from './zh-chess.js';
import chess from './chess.js';
import goBoard from './go.js';
import jumpBoard from './jump.js';

document.querySelector('#start').addEventListener('click', () => {
    let clip = parseFloat(document.querySelector('input[name="other"]:checked').dataset.clip) * 2;
    const arr = [
        {
            id: 'zh-chess',
            produce: (pdf) => {
                zhChess(pdf, 297 - clip, 420 - clip, 33);
            }
        },
        {
            id: 'chess',
            produce: (pdf) => {
                chess(pdf, 297 - clip, 420 - clip, 35);
            }
        },
        {
            id: 'go',
            produce: (pdf) => {
                goBoard(pdf, 297 - clip, 420 - clip, 13, 23, 24, 5);
            }
        },
        {
            id: 'jump',
            produce: (pdf) => {
                jumpBoard(pdf, 297 - clip, 420 - clip, 18.2);
            }
        }
    ];

    const pdf = new Pdf();
    arr.forEach(o => {
        if (document.querySelector('#' + o.id).checked) {
            o.produce(pdf);
        }
    });
    document.querySelector('iframe').contentWindow.location.replace(pdf.output('url'));
    document.querySelectorAll('.page').forEach(ele => {
        ele.classList.toggle('hide-page');
    });
    window.history.pushState(null, null);
});

window.addEventListener('popstate', () => {
    document.querySelectorAll('.page').forEach(ele => {
        ele.classList.toggle('hide-page');
    });
});
