import less from './index';

// ブラウザ向けバンドルでは従来どおりグローバル変数 `less` として公開する
declare global {
  var less: typeof import('./index').default;
}
globalThis.less = less;
