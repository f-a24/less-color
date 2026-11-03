# less-functions

[Less](https://lesscss.org/) の色関数を TypeScript に移植したライブラリです。
Less 本家と同じ結果を返すことを目標にしており、テストで `less` パッケージの出力と照合しています。

## 使い方

```ts
import {
  mix,
  tint,
  spin,
  contrast,
  lighten,
  fade,
  multiply,
  hue
} from 'less-functions';

mix('#000000', '#ffffff', 25); // '#bfbfbf'
tint('#336699', 50); // '#99b3cc'
spin('#336699', 180); // '#996633'
contrast('#336699'); // '#ffffff'
lighten('#336699', 20); // '#6699cc'
fade('#336699', 50); // 'rgba(51, 102, 153, 0.5)'
multiply('#ff6600', '#999999'); // '#993d00'
mix('red', 'rgba(0, 0, 255, 0.5)'); // 'rgba(191, 0, 64, 0.75)'
hue('#336699'); // 210
```

従来どおりデフォルトエクスポートからも使えます（ただし、デフォルトエクスポートに含まれるのは `contrast` / `convert` / `tint` / `shade` / `luma` / `spin` / `mix` だけです）。

```ts
import lf from 'less-functions';

lf.mix('#000000', '#ffffff');
lf.convert.hex2rgb('#f80'); // [255, 136, 0]
```

## 色の指定と出力

色を受け取る関数は、次の形式の文字列に対応しています。不正な形式を渡すと `TypeError` を投げます。

- `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa`（`#` は省略可）
- `rgb()` / `rgba()` / `hsl()` / `hsla()`（カンマ区切りと `rgb(0 128 255 / 50%)` のようなスペース区切りの両方）
- CSS の色名（`red`、`rebeccapurple` など 148 色）と `transparent`

色を返す関数は、Less と同じく不透明なら `#rrggbb` を、半透明なら `rgba(r, g, b, a)` を返します。

割合を指定する引数（`amount` / `weight` / `threshold`）には、数値と `'10%'` のような文字列のどちらでも渡せます。

## 関数一覧

### 色の混合・回転

| 関数                                                                     | Less での書き方                    | 説明                                                                     |
| ------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------ |
| `mix(color1, color2, weight = 50)`                                       | `mix(@c1, @c2, 50%)`               | 2 色を混ぜる。`weight` は `color1` の割合（0〜100）                      |
| `tint(color, amount)`                                                    | `tint(@c, 10%)`                    | 白と混ぜる                                                               |
| `shade(color, amount)`                                                   | `shade(@c, 10%)`                   | 黒と混ぜる                                                               |
| `spin(color, angle)`                                                     | `spin(@c, 10)`                     | 色相を `angle` 度回転させる                                              |
| `contrast(color, dark = '#000000', light = '#ffffff', threshold = 0.43)` | `contrast(@c, @dark, @light, 43%)` | 背景色に対して読みやすい方の色を返す。`threshold` は 0〜1 または `'43%'` |

### HSL・アルファの操作

`amount` は 0〜100 です。`method` に `'relative'` を渡すと、現在の値に対する割合で増減します（Less の `relative` と同じ）。

| 関数                                 | Less での書き方       | 説明                       |
| ------------------------------------ | --------------------- | -------------------------- |
| `lighten(color, amount, method?)`    | `lighten(@c, 10%)`    | 明度を上げる               |
| `darken(color, amount, method?)`     | `darken(@c, 10%)`     | 明度を下げる               |
| `saturate(color, amount, method?)`   | `saturate(@c, 10%)`   | 彩度を上げる               |
| `desaturate(color, amount, method?)` | `desaturate(@c, 10%)` | 彩度を下げる               |
| `greyscale(color)`                   | `greyscale(@c)`       | 彩度を 0 にする            |
| `fadein(color, amount, method?)`     | `fadein(@c, 10%)`     | 不透明度を上げる           |
| `fadeout(color, amount, method?)`    | `fadeout(@c, 10%)`    | 不透明度を下げる           |
| `fade(color, amount)`                | `fade(@c, 50%)`       | 不透明度を `amount` にする |

### 成分の取得

| 関数                                          | 戻り値                                      |
| --------------------------------------------- | ------------------------------------------- |
| `hue(color)`                                  | 色相（0〜360）                              |
| `saturation(color)`                           | 彩度（0〜100）                              |
| `lightness(color)`                            | 明度（0〜100）                              |
| `red(color)` / `green(color)` / `blue(color)` | 各成分（0〜255）                            |
| `alpha(color)`                                | 不透明度（0〜1）                            |
| `luma(color)`                                 | ガンマ補正ありの相対輝度 × アルファ（0〜1） |
| `luminance(color)`                            | ガンマ補正なしの輝度 × アルファ（0〜1）     |

### ブレンド

`color1` を背景、`color2` を前景として合成します（Less と同じく W3C Compositing の計算式でアルファも合成）。

| 関数                         | 説明              |
| ---------------------------- | ----------------- |
| `multiply(color1, color2)`   | 乗算              |
| `screen(color1, color2)`     | スクリーン        |
| `overlay(color1, color2)`    | オーバーレイ      |
| `softlight(color1, color2)`  | ソフトライト      |
| `hardlight(color1, color2)`  | ハードライト      |
| `difference(color1, color2)` | 差の絶対値        |
| `exclusion(color1, color2)`  | 除外              |
| `average(color1, color2)`    | 平均（Less 独自） |
| `negation(color1, color2)`   | 反転（Less 独自） |

### 変換・ユーティリティ

| 関数                 | 説明                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `parseColor(input)`  | 色の文字列を `{ r, g, b, a }` に変換する                            |
| `formatColor(color)` | `{ r, g, b, a }` を `'#rrggbb'` または `'rgba(…)'` にする           |
| `hex2rgb(hex)`       | `'#f80'` → `[255, 136, 0]`（3 桁・6 桁の hex のみ）                 |
| `rgb2hex(rgb)`       | `[255, 136, 0]` → `'#ff8800'`（0〜255 に収めてから四捨五入）        |
| `rgb2hsl(rgb)`       | RGB → `[h, s, l]`（h は 0〜360、s と l は 0〜1）                    |
| `hsl2rgb(hsl)`       | HSL → RGB（色相は負の値や 360 以上でも可）                          |
| `toRGB(rgb)`         | `number` の配列を検証して `RGBType` にする（範囲外は `RangeError`） |
| `toRGBValue(n)`      | `number` を検証して 0〜255 の `RGBValue` にする                     |

`RGBType` の各要素は 0〜255 です。整数リテラル（`[255, 136, 0]`）はそのまま書けますが、計算結果などの `number` は `toRGB` / `toRGBValue` で検証してから渡します。

```ts
rgb2hex([255, 136, 0]); // OK
rgb2hex([256, 0, 0]); // 型エラー
rgb2hex(toRGB([r, g, b])); // number は検証してから渡す
```

## Less との違い

- `luma` / `luminance` は Less では `%` 表記ですが、こちらは 0〜1 の数値で返します
- `saturation` / `lightness` は `%` を付けない 0〜100 の数値で返します
- Less は `hsl()` で指定した色を `hsl()` 形式のまま出力することがありますが、こちらは常に `#rrggbb` か `rgba()` で返します
- `contrast` の `dark` / `light` は、渡された文字列をそのまま返します

## 開発

```bash
bun install
```

```bash
bun test
```

```bash
bun run build
```

`dist/` に ESM と型定義が出力されます。そのほか `lint` / `format` / `typecheck` スクリプトがあります。

## ライセンス

MIT
