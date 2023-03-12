import { PdfDict, PdfDictRef } from './pdf-core.js';

export default function Pdf() {
    //Catalog
    this._catalog = new PdfDict({
        Type: '/Catalog',
        Pages: null,
    });

    //PageTree
    this._pageTree = new PdfDict({
        Type: '/Pages',
        Kids: [],
        Count: 0
    });
    this._catalog.entries.Pages = this._pageTree; //加到 catalog

    this._currentPage = null;
}

Pdf.prototype.addPage = function (width, height) {
    this._currentPage = new PdfDict({
        Type: '/Page',
        Parent: new PdfDictRef(this._pageTree),
        Resources: {},
        Contents: [],
        MediaBox: [0, 0, width * 72 / 25.4, height * 72 / 25.4]
    });
    this._pageTree.entries.Kids.push(this._currentPage); //加到 catalog
    ++this._pageTree.entries.Count;
}

Pdf.prototype.getPageSize = function () {
    if (this._currentPage === null) {
        return null;
    }
    return this._currentPage.entries.MediaBox.slice(2);
}

Pdf.prototype.write = function (stream) {
    this._currentPage.entries.Contents.push(new PdfDict({}, stream));
}

Pdf.prototype.addResource= function(classname, objname, dict) {
    const res = this._currentPage.entries.Resources;
    if(!res[classname]) {
        res[classname] = {};
    }
    res[classname][objname] = dict;
}

Pdf.prototype.output = function (outputType) {
    let result = PdfDict.finalize(this._catalog);
    switch (outputType) {
        case 'blob':
            return new Blob(result, { type: 'application/pdf' });
        case 'url':
            return URL.createObjectURL(new Blob(result, { type: 'application/pdf' }));
        case 'array':
            let tmp = result.map(x => typeof x === 'string' ? new TextEncoder().encode(x) : x);
            let len = tmp.reduce((s, x) => s + x.byteLength, 0);
            let obj = tmp.reduce((o, x) => {
                o.arr.set(x, o.idx);
                o.idx += x.byteLength;
                return o;
            }, { idx: 0, arr: new Uint8Array(len) });
            return obj.arr;
        default:
            return result;
    }
}
