import {zlibSync} from './node_modules/fflate/esm/browser.js';

/**
 * PDF Dictionary 物件
 * 
 * @param {Oject} [entries={}] dict 的項目
 * @param {string|Uint8Array} [stream=null] stream 部分
 * @param {bool} [nocompress=false] 不做壓縮
 */
function PdfDict(entries, stream, nocompress) {
    this.entries = typeof entries === 'object' ? entries : {};
    this.stream = typeof stream === 'string' || stream instanceof Uint8Array ? stream : null;
    this.nocompress = !!nocompress;
}

/**
 * 轉成內容
 * 
 * @param {Integer} id 此節點 id
 * @param {Array} queue 待處理（含已處理）block 陣列
 * @returns 此 blobk 內容
 */
PdfDict.prototype._parsePdfContent = function (id, queue) {
    function parseValue(val) {
        if (typeof val === 'string' || typeof val === 'number') {
            return val;
        }
        if (val instanceof PdfDict) {
            queue.push(val);
            return `${queue.length} 0 R`;
        }
        if (val instanceof PdfDictRef) {
            return `${val.dict.id} 0 R`;
        }
        if (Array.isArray(val)) {
            let n = val.length;
            let tmp = [];
            for (let i = 0; i < n; ++i) {
                tmp.push(parseValue(val[i]));
            }
            return `[ ${tmp.join(' ')} ]`;
        }
        if (val instanceof Object && val.constructor === Object) {
            let tmp = [];
            for (let k in val) {
                tmp.push(`/${k} ${parseValue(val[k])}`);
            }
            return `<< ${tmp.join(' ')} >>`;
        }
        throw '未知的類型';
    }
    if (this.id !== undefined) {
        throw '重複寫入';
    }
    this.id = id;
    if (typeof this.stream === 'string' || this.stream instanceof Uint8Array) {
        if (!this.nocompress) {
            if(typeof this.stream === 'string') {
                this.stream = new TextEncoder().encode(this.stream);
            }
            this.stream = zlibSync(this.stream);
        }
    }
    if (this.stream instanceof Uint8Array) {
        this.entries.Length = this.stream.byteLength;
        if (!Array.isArray(this.entries.Filter)) {
            this.entries.Filter = [];
        }
        this.entries.Filter.push('/FlateDecode')
    } else if (typeof this.stream === 'string') {
        this.entries.Length = this.stream.length;
    }
    const entries = this.entries;
    let result = [`${id} 0 obj\n`];
    result.push('<<\n');
    for (let entryKey in entries) {
        result.push(`/${entryKey} ${parseValue(entries[entryKey])}\n`);
    }
    result.push('>>\n');
    if (typeof this.stream === 'string' || this.stream instanceof Uint8Array) {
        result.push('stream\n');
        result.push(this.stream); //這邊是壓縮後的 Uint8Array
        result.push('\nendstream\n');
    }
    result.push('endobj\n');
    this.entries = null;
    this.stream = null;
    return result;
}

/**
 * 產生 pdf
 * 
 * @param {PdfDict} rootDict Catalog
 * @returns {Array} pdf 內容，一個混合 string 跟 Uint8Array 的陣列
 */
PdfDict.finalize = function (rootDict) {
    //取得 blocks 
    let blocks;
    if (Array.isArray(rootDict)) {
        blocks = rootDict;
        rootDict = blocks[0];
    } else {
        blocks = [rootDict];
    }
    let idx = 0;
    while (idx < blocks.length) {
        blocks[idx] = blocks[idx]._parsePdfContent(idx + 1, blocks);
        ++idx;
    }
    //輸出
    //寫入 header
    let output = ['%PDF-1.7\n%§§\n'];
    let pos = output[0].length + 2;
    let posRec = [];
    //寫入 blocks 並紀錄位置
    blocks.forEach(b => {
        posRec.push(pos);
        b.forEach(x => {
            pos += (x instanceof Uint8Array ? x.byteLength : x.length);
            output.push(x);
        });
    });
    blocks = null;
    //寫入 xref
    output.push('xref\n');
    output.push(`0 ${posRec.length + 1}\n`);
    output.push('0000000000 65535 f \n');
    posRec.forEach(pos => {
        let s = pos.toString();
        s = '0'.repeat(10 - s.length) + s;
        output.push(`${s} 00000 n \n`);
    });
    output.push('trailer\n');
    output.push('<<\n');
    output.push(`/Size ${posRec.length + 1}\n`);
    output.push(`/Root ${rootDict.id} 0 R\n`);
    output.push('>>\n');
    output.push('startxref\n');
    output.push(`${pos}\n`);
    output.push('%%EOF\n');
    return output;
}

/**
 * 某 PdfDict 的參照
 * 這只能用在子物件的 entry 需要參照其 parent 時
 * 
 * @param {PdfDict} dict 
 */
function PdfDictRef(dict) {
    this.dict = dict;
}

export { PdfDict, PdfDictRef };
