import { terser } from "rollup-plugin-terser";
import html  from '@rollup/plugin-html';
import fs from 'fs';

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'docs/index.bundle.js',
            format: 'iife',
            plugins: [
                terser()
            ]
        },
        plugins: [
            html({
                template: function(param) {
                    let html = fs.readFileSync('index.html', {encoding: 'utf-8'});
                    let src = '<script src="src/index.js" type="module"></script>';
                    let repl = '<script src="./index.bundle.js"></script>';
                    return html.replace(src, repl);
                }
            }),
        ]
    }
];
