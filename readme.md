直接使用的話直接到：[示範頁面](https://ren1244.github.io/board-pdf-generator/)

## 說明

用來產生可列印棋盤的 PDF，版面為 A3 大小，針對超商列印也有選項可以做調整。

目前可選擇的棋盤有：

* 象棋
* 西洋棋
* 圍棋（13路）
* 跳棋

## Build

1. 象棋會用到字型，`script/loadFont.php` 會讀取字型檔（ttf）後產生 `src/font.js`
2. 之後用 rollup 打包即可

## 檔案說明

* debug.html + src/main.js: 開發新的棋盤類型使用，可以同時預覽 pdf 與 pdf 內容
* index.html + src/index.js: 實際輸出的頁面
