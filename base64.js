const x2c = new Uint8Array(64);  //x: 0~63 => code: ascii
const c2x = new Uint8Array(123); //code: ascii => x: 0~63
c2x.fill(255);
for (let x = 0; x < 64; ++x) {
    let c = x;
    c += c < 52 ? (c < 26 ? 65 : 71) : (c < 62 ? -4 : (c === 62 ? -19 : -16));
    x2c[x] = c;
    c2x[c] = x;
}

/**
 * base64 編碼
 * @param {ArrayBuffer|Uint8Array} data
 * @returns {string}
 */
function base64_encode(data) {
    const map = x2c;
    if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
    }
    if (!data instanceof Uint8Array) {
        throw new TypeError('參數應為 ArrayBuffer 或 Uint8Array');
    }
    let n = data.byteLength, x, s = new Uint8Array(((n + 2) / 3 | 0) * 4), sIdx = 0;
    for (let i = 0; i < n; ++i) {
        x = data[i];
        s[sIdx++] = map[x >>> 2];
        if (++i >= n) {
            s[sIdx++] = map[x << 4 & 0x3f];
            s[sIdx++] = 61;
            s[sIdx++] = 61;
            break;
        }
        x = (x << 8 | data[i]) & 0x3ff;
        s[sIdx++] = map[x >>> 4];
        if (++i >= n) {
            s[sIdx++] = map[x << 2 & 0x3f];
            s[sIdx++] = 61;
            break;
        }
        x = (x << 8 | data[i]) & 0xfff;
        s[sIdx++] = map[x >>> 6];
        s[sIdx++] = map[x & 0x3f];
    }
    return new TextDecoder().decode(s);
}

/**
 * base64 解碼
 * @param {string} str
 * @returns {Uint8Array}
 */
function base64_decode(str) {
    const map = c2x;
    let x, c, n = str.length;
    for (let i = 0; i < 4; ++i) {
        if (n > 0 && str.charCodeAt(n - 1) === 61) {
            --n;
        }
    }
    let k = 0, arr = new Uint8Array((n >>> 2) * 3 + ((n & 3) > 1 ? (n & 3) - 1 : 0));
    for (let i = 0; i < n; ++i) {
        // i % 4 === 0
        c = str.charCodeAt(i);
        if ((c = c < 123 ? map[c] : 255) === 255) {
            throw 'base64 編碼錯誤';
        }
        x = c;
        // i % 4 === 1
        if (++i >= n) {
            throw 'base64 編碼錯誤';
        }
        c = str.charCodeAt(i);
        if ((c = c < 123 ? map[c] : 255) === 255) {
            throw 'base64 編碼錯誤';
        }
        x = x << 6 | c;
        arr[k++] = x >>> 4;
        // i % 4 === 2
        if (++i >= n) {
            break;
        }
        c = str.charCodeAt(i);
        if ((c = c < 123 ? map[c] : 255) === 255) {
            throw 'base64 編碼錯誤';
        }
        x = (x << 6 | c) & 0x3ff;
        arr[k++] = x >>> 2;
        // i % 4 === 3
        if (++i >= n) {
            break;
        }
        c = str.charCodeAt(i);
        if ((c = c < 123 ? map[c] : 255) === 255) {
            throw 'base64 編碼錯誤';
        }
        x = (x << 6 | c) & 0xff;
        arr[k++] = x;
    }
    return arr;
}

export { base64_encode, base64_decode };
