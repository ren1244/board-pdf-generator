## Build

1. 象棋會用到字型，`script/loadFont.php` 會讀取字型檔（ttf）後產生 `src/font.js`
2. 之後用 rollup 打包即可

## 檔案說明

* debug.html + src/main.js: 開發新的棋盤類型使用，可以同時預覽 pdf 與 pdf 內容
* index.html + src/index.js: 實際輸出的頁面
