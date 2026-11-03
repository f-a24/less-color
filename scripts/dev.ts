// 開発用サーバー: index.js へのリクエストごとに src をバンドルし直して配信する
const server = Bun.serve({
  port: 3000,
  routes: {
    '/': Bun.file('public/index.html'),
    '/index.js': async () => {
      const result = await Bun.build({
        entrypoints: ['src/browser.ts'],
        target: 'browser',
        format: 'iife',
        sourcemap: 'inline'
      });
      if (!result.success) {
        return new Response(result.logs.join('\n'), { status: 500 });
      }
      return new Response(result.outputs[0]);
    }
  }
});

console.log(`開発サーバーを起動しました: ${server.url}`);
