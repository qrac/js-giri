# JS切り

JS切りは、現在のホスト名だけを対象に JavaScript をワンクリックで無効化する小さな Chrome 拡張です。

ツールバーのアイコンを押すと、そのタブのホスト名に対して JavaScript を無効化して再読み込みします。もう一度押すと、JS切りが追加した設定を削除して Chrome 本来の設定へ戻し、再読み込みします。右クリックの「設定」から、JavaScript を切っているホスト名を確認・解除できます。

## 意図的に実装していないもの

- ページ本文や DOM の読み取り・解析
- 閲覧履歴、広告ブロック統計、Telemetry、Analytics
- 外部 API、リモートコード、リモート設定、Cloud Sync
- EasyList / EasyPrivacy、要素非表示、巨大なフィルターリスト
- AI 機能

## Chrome に読み込む

```sh
npm install
npm run build
```

1. Chrome で `chrome://extensions` を開く
2. 「デベロッパー モード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」を選ぶ
4. このリポジトリの `dist` ディレクトリを指定する

## 開発とテスト

```sh
npm run dev       # dist を監視ビルド
npm run check     # JSDoc 型チェック、Unit Test、build
npm test          # Unit Test
```

## Permissions

| Permission | 理由 |
| --- | --- |
| `contentSettings` | ユーザー操作で、対象ホスト名の JavaScript 設定を block または削除するため |
| `storage` | JS切り自身が block したホスト名だけを端末内に保存するため |
| `tabs` | タブ切り替え・遷移時に URL のホスト名を確認し、タブごとのアイコンを更新するため |
| `contextMenus` | 拡張アイコンの右クリックに「設定」を1項目だけ表示するため |

`host_permissions`、Content Script、外部通信は使用しません。保存するのは JS切り対象のホスト名だけで、パス、クエリ、ページタイトル、本文は保存しません。詳細は [PRIVACY.md](PRIVACY.md) を参照してください。
