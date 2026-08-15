# Chrome Web Store Listing — JS斬り

> Last Updated: 2026-08-14

## Store Listing

- Extension Name: JS斬り
- Short Description: 現在のサイトのJavaScriptをワンクリックで斬ります。
- Category: Productivity
- Single Purpose: 現在のホスト名のJavaScriptをユーザー操作で無効化・復元する。
- Primary Language: Japanese

### Detailed Description

JS斬りは、現在表示しているサイトのJavaScriptをワンクリックで無効化・復元できる小さなChrome拡張です。

対象は現在の正確なホスト名だけです。設定画面では対象サイトの確認と個別解除ができます。

ページ本文やDOMは読み取りません。閲覧履歴、Telemetry、Analyticsを収集せず、外部サーバーへデータを送信しません。

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
| --- | --- | --- | --- |
| Store Icon | 128×128 PNG | Ready | `icons/on/icon-128.png` |
| Screenshot 1 | 1280×800 or 640×400 | Not created | Options page and a cut site |
| Screenshot 2 | 1280×800 or 640×400 | Not created | Toolbar action states |

## Permissions Justification

| Permission | Justification |
| --- | --- |
| `contentSettings` | ユーザーがアイコンを押したホスト名のJavaScriptを無効化し、再操作または設定画面からその変更を削除するため。 |
| `storage` | JS斬り自身が無効化したhostnameだけを端末内で管理し、安全に解除するため。 |
| `tabs` | タブ切り替え・ページ遷移時に現在のhostnameを確認し、タブごとのアイコン状態を正しく表示するため。ページ本文は読み取らない。 |
| `contextMenus` | 拡張アイコンの右クリックメニューに設定ページへの入口を1つ表示するため。 |

`host_permissions` は使用しない。

## Privacy & Data Use

- User data collection: No
- hostnameは対象設定の管理目的で端末内にのみ保存し、外部送信しない
- ページ内容、閲覧履歴、個人情報、Telemetry、Analyticsを収集しない
- データを販売・第三者共有・信用判断に利用しない
- Privacy Policy: 公開前に `PRIVACY.md` を公開URLへ配置して記入する

## Version History

| Version | Date | Changes | Status |
| --- | --- | --- | --- |
| 0.1.0 | 2026-08-14 | Initial implementation | Draft |

## Pre-publish Checklist

- [ ] `manifest.json` のname、version、descriptionを確認する
- [ ] versionを公開済み版より大きくする
- [ ] 全permissionが実装に必要で、上記説明と一致することを確認する
- [ ] `PRIVACY.md` を公開URLへ配置し、Dashboardの開示内容と一致させる
- [ ] 16 / 48 / 128pxアイコンを実機で確認する
- [ ] 1280×800または640×400の正確なスクリーンショットを1枚以上作る
- [ ] Store descriptionと実装機能が一致することを確認する
- [ ] `npm run check` と `npm test` を実行する
- [ ] unpacked extensionを手動確認する
- [ ] `dist` のみをZIP化し、開発用ファイルを含めない
- [ ] 公開者名、連絡先、Support URL、Privacy Policy URLをDashboardで記入する

現時点では公開・申請を行わない。
