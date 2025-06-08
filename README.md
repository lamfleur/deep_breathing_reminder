# 深呼吸リマインダー

Edge 向け拡張機能です。入力操作を検知してポップアップで深呼吸を促します。

## セットアップ

```bash
npm ci
npm run lint
npm test
```

## パッケージ作成

1. `manifest.json` のバージョンを更新
2. `npm run lint && npm test`
3. `zip -r extension.zip .`

Edge の拡張機能として読み込みます。
