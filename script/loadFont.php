<?php
require('vendor/autoload.php');

use ren1244\sfnt\Sfnt;
use ren1244\sfnt\TypeReader;

header('Content-Type: text/plain');

$fontRaw = file_get_contents(__DIR__ . '/../../asset/font/MoeLI.ttf');
$font = new Sfnt(new TypeReader($fontRaw));

$head = $font->table('head');
$hhea = $font->table('hhea');
$os2 = $font->table('OS/2');
$cmap = $font->table('cmap');
$hmtx = $font->table('hmtx');
$glyf = $font->table('glyf');

$nameTable = $font->table('name');
if (
    (
        ($nameArray = $nameTable->getNames(3, 10)) === null &&
        ($nameArray = $nameTable->getNames(3, 1)) === null
    ) || !isset($nameArray[6])
) {
    throw new Exception('no postscript fontname');
}
$fontname = $nameArray[6];

$text = mb_convert_encoding('楚河漢界', 'UTF-32', 'UTF-8');
$unicodeArray = unpack('N*', $text);
sort($unicodeArray, SORT_NUMERIC);
$usedGid = [];
$newGid = 0;
$charInfo = [];
$bbox = null;
foreach ($unicodeArray as $unicode) {
    $gid = $cmap->getGid($unicode);
    $usedGid[$gid] = 1;
    $ch = mb_convert_encoding(pack('N', $unicode), 'UTF-8', 'UTF-32');
    $charInfo[$ch] = [
        'id' => ++$newGid,
        'w' => $hmtx->getWidth($gid),
        'lsb' => $hmtx->getLsb($gid),
    ];
}
$data = $font->subset($usedGid);

$mtx = [
    'fontname' => $fontname,
    'unitsPerEm' => $head->unitsPerEm,
    'bbox' => [
        $head->xMin,
        $head->yMin,
        $head->xMax,
        $head->yMax
    ],
    'italicAngle' => $font->table('post')->italicAngle,
    'ascent' => $hhea->ascender,
    'descent' => $hhea->descender,
    'capHeight' => ($os2->sCapHeight ?? $hhea->ascender),
    'typoAscender'  => $os2->sTypoAscender,
    'typoDescender' => $os2->sTypoDescender,
    'typoLineGap' => $os2->sTypoLineGap,
    'charInfo' => $charInfo,
    'data' => base64_encode(gzcompress($data, 9)),
];

$json = json_encode($mtx, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
file_put_contents(__DIR__ . '/../src/font.js', 'export default ' . $json . ";\n");
