# less-functions

[Less](https://lesscss.org/) の色関数を TypeScript に移植したライブラリです。
Less 本家と同じ結果を返すことを目標にしており、テストで `less` パッケージの出力と照合しています。

## 使い方

```ts
import { mix, tint, shade, spin, contrast, luma } from 'less-functions';

mix('#000000', '#ffffff', 25); // '#bfbfbf'
tint('#336699', 50); // '#99b3cc'
spin('#336699', 180); // '#996633'
contrast('#336699'); // '#ffffff'
```

従来どおりデフォルトエクスポートからも使えます。

```ts
import lf from 'less-functions';

lf.mix('#000000', '#ffffff');
lf.convert.hex2rgb('#f80'); // [255, 136, 0]
```

## 関数一覧

色は `#rrggbb` または `#rgb` 形式の文字列で指定します（`#` は省略可）。
それ以外の形式を渡すと `TypeError` を投げます。

| 関数                                                                     | Less での書き方                    | 説明                                                      |
| ------------------------------------------------------------------------ | ---------------------------------- | --------------------------------------------------------- |
| `mix(color1, color2, weight = 50)`                                       | `mix(@c1, @c2, 50%)`               | 2 色を混ぜる。`weight` は `color1` の割合（0〜100）       |
| `tint(color, amount)`                                                    | `tint(@c, 10%)`                    | 白と混ぜる                                                |
| `shade(color, amount)`                                                   | `shade(@c, 10%)`                   | 黒と混ぜる                                                |
| `spin(color, angle)`                                                     | `spin(@c, 10)`                     | 色相を `angle` 度回転させる                               |
| `contrast(color, dark = '#000000', light = '#ffffff', threshold = 0.43)` | `contrast(@c, @dark, @light, 43%)` | 背景色に対して読みやすい方の色を返す。`threshold` は 0〜1 |
| `luma(color)`                                                            | `luma(@c)`                         | 相対輝度を 0〜1 で返す（Less は %）                       |

### 変換関数

| 関数           | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| `hex2rgb(hex)` | `'#f80'` → `[255, 136, 0]`                                   |
| `rgb2hex(rgb)` | `[255, 136, 0]` → `'#ff8800'`（0〜255 に収めてから四捨五入） |
| `rgb2hsl(rgb)` | RGB → `[h, s, l]`（h は 0〜360、s と l は 0〜1）             |
| `hsl2rgb(hsl)` | HSL → RGB（色相は負の値や 360 以上でも可）                   |

## Less との違い

- 引数の割合はパーセント文字列ではなく数値で渡します（`50%` → `50`、`contrast` の `threshold` だけは `0.43` のように 0〜1）
- アルファ付きの色（`#rrggbbaa` など）にはまだ対応していません

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
