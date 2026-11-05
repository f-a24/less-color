import * as lc from '../src/index.js';

// 1 枚のカードに表示する内容（呼び出し式と結果）
type Sample = { code: string; value: string };

const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

const baseInput = $<HTMLInputElement>('base');
const basePicker = $<HTMLInputElement>('base-picker');
const secondInput = $<HTMLInputElement>('second');
const secondPicker = $<HTMLInputElement>('second-picker');
const amountInput = $<HTMLInputElement>('amount');
const angleInput = $<HTMLInputElement>('angle');

// 最後に解析できた色を保持し、入力途中の不正な値では表示を崩さない
let base = baseInput.value;
let second = secondInput.value;

const q = (s: string) => `'${s}'`;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const card = ({ code, value }: Sample) => `
  <div class="card">
    <div class="swatch" style="--c: ${escapeHtml(value)}"></div>
    <div class="card-body">
      <code>${escapeHtml(code)}</code>
      <code class="result">${escapeHtml(value)}</code>
    </div>
  </div>`;

const renderCards = (id: string, samples: Sample[]) => {
  $(id).innerHTML = samples.map(card).join('');
};

const render = () => {
  const amount = Number(amountInput.value);
  const angle = Number(angleInput.value);
  const b = q(base);
  const s = q(second);

  $('amount-out').textContent = String(amount);
  $('angle-out').textContent = String(angle);

  renderCards('adjust', [
    { code: `lighten(${b}, ${amount})`, value: lc.lighten(base, amount) },
    { code: `darken(${b}, ${amount})`, value: lc.darken(base, amount) },
    { code: `saturate(${b}, ${amount})`, value: lc.saturate(base, amount) },
    {
      code: `desaturate(${b}, ${amount})`,
      value: lc.desaturate(base, amount)
    },
    {
      code: `lighten(${b}, ${amount}, 'relative')`,
      value: lc.lighten(base, amount, 'relative')
    },
    { code: `greyscale(${b})`, value: lc.greyscale(base) },
    { code: `fade(${b}, ${amount})`, value: lc.fade(base, amount) },
    { code: `fadeout(${b}, ${amount})`, value: lc.fadeout(base, amount) }
  ]);

  renderCards('mixing', [
    { code: `mix(${b}, ${s}, ${amount})`, value: lc.mix(base, second, amount) },
    { code: `tint(${b}, ${amount})`, value: lc.tint(base, amount) },
    { code: `shade(${b}, ${amount})`, value: lc.shade(base, amount) },
    { code: `spin(${b}, ${angle})`, value: lc.spin(base, angle) },
    { code: `contrast(${b})`, value: lc.contrast(base) }
  ]);

  // 白に近い側から黒に近い側へ並べる
  const steps = [80, 60, 40, 20];
  const palette = [
    ...steps.map(n => ({ label: `tint ${n}`, value: lc.tint(base, n) })),
    { label: 'base', value: lc.formatColor(lc.parseColor(base)) },
    ...steps
      .toReversed()
      .map(n => ({ label: `shade ${n}`, value: lc.shade(base, n) }))
  ];
  $('palette').innerHTML = palette
    .map(
      ({ label, value }) =>
        `<div style="background: ${escapeHtml(value)}; color: ${lc.contrast(value)}">
          <span>${label}</span><span class="mono">${escapeHtml(value)}</span>
        </div>`
    )
    .join('');

  const blends = {
    multiply: lc.multiply,
    screen: lc.screen,
    overlay: lc.overlay,
    softlight: lc.softlight,
    hardlight: lc.hardlight,
    difference: lc.difference,
    exclusion: lc.exclusion,
    average: lc.average,
    negation: lc.negation
  };
  renderCards(
    'blend',
    Object.entries(blends).map(([name, fn]) => ({
      code: `${name}(${b}, ${s})`,
      value: fn(base, second)
    }))
  );

  renderCards('chain', [
    {
      code: `color(${b}).darken(3).lighten(5).toString()`,
      value: lc.color(base).darken(3).lighten(5).toString()
    },
    {
      code: `lighten(darken(${b}, 3), 5)`,
      value: lc.lighten(lc.darken(base, 3), 5)
    },
    {
      code: `color(${b}).spin(${angle}).fade(${amount}).toHex()`,
      value: lc.color(base).spin(angle).fade(amount).toHex()
    },
    {
      code: `color(${b}).multiply(${s}).tint(${amount}).toHslString()`,
      value: lc.color(base).multiply(second).tint(amount).toHslString()
    }
  ]);

  const rows: [string, string | number][] = [
    [`toHex(${b})`, lc.toHex(base)],
    [`toRgbString(${b})`, lc.toRgbString(base)],
    [`toHslString(${b})`, lc.toHslString(base)],
    [`toRgb(${b})`, JSON.stringify(lc.toRgb(base))],
    [`hue(${b})`, lc.hue(base)],
    [`saturation(${b})`, lc.saturation(base)],
    [`lightness(${b})`, lc.lightness(base)],
    [
      `red / green / blue`,
      `${lc.red(base)} / ${lc.green(base)} / ${lc.blue(base)}`
    ],
    [`alpha(${b})`, lc.alpha(base)],
    [`luma(${b})`, lc.luma(base)],
    [`luminance(${b})`, lc.luminance(base)]
  ];
  $('info').innerHTML = rows
    .map(
      ([k, v]) =>
        `<tr><th><code>${escapeHtml(k)}</code></th><td><code>${escapeHtml(String(v))}</code></td></tr>`
    )
    .join('');
};

// テキスト入力とカラーピッカーを同期させる
const bindColor = (
  text: HTMLInputElement,
  picker: HTMLInputElement,
  errorId: string,
  set: (c: string) => void
) => {
  const error = $(errorId);
  text.addEventListener('input', () => {
    const value = text.value.trim();
    const valid = lc.isValidColor(value);
    text.setAttribute('aria-invalid', String(!valid));
    error.textContent = valid ? '' : '解析できない色です';
    if (!valid) return;
    set(value);
    // カラーピッカーはアルファを持てないので #rrggbb に丸めて渡す
    picker.value = lc.toHex(lc.fade(value, 100));
    render();
  });
  picker.addEventListener('input', () => {
    text.value = picker.value;
    text.setAttribute('aria-invalid', 'false');
    error.textContent = '';
    set(picker.value);
    render();
  });
};

bindColor(baseInput, basePicker, 'base-error', c => (base = c));
bindColor(secondInput, secondPicker, 'second-error', c => (second = c));
amountInput.addEventListener('input', render);
angleInput.addEventListener('input', render);

render();
