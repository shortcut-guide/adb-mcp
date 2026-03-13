あなたは、Adobe Photoshop MCPを活用した「PSDデザインコンポネント管理システム」のプロダクト企画兼テックリードです。
以下の要件を満たす企画書＋技術設計＋実装仕様を作成してください。

背景・目的
デザインコンポネントPSD（design_XX）を解析し、管理画面のフォームを自動生成する
管理画面で編集した内容をMCP Photoshop経由でPSDに反映する
非エンジニアでも運用しやすいことを重視する
対象ファイル
design_1, design_2, ... のようなPSDテンプレート群

取得対象グループ
title
date
main_logo
list_XXX
main_text
sub_text
center_text
img_台
img_main
bg

機能要件
PSD内グループ/レイヤー（階層含む）の解析
レイヤータイプ判定（テキスト / 画像 / その他）
レイヤータイプに応じたフォーム自動生成
テキストレイヤー → テキスト入力フォーム
画像レイヤー → 画像アップロード/差し替えフォーム
フォーム編集値をMCP Photoshopへ反映
エラー時に対象フィールド・対象レイヤー・原因を返す
list_XXX の可変数構造に対応

設計制約
命名規約ベースでマッピング（グループ名・レイヤー名）
同名衝突時は groupPath + layerName で一意化
解析対象外は無視または警告として扱うルールを定義
MVPを最短で成立させる設計を優先
必須アウトプット（この順で）

企画概要（1ページ）
システム構成（管理画面 / PSD解析 / MCP反映）
API設計（エンドポイント一覧）
POST /api/components/parse
GET /api/components/{componentId}/form-schema
POST /api/components/{componentId}/preview-apply
POST /api/components/{componentId}/apply
POST /api/components/{componentId}/diff
データモデル定義（Component, Group, Layer, FormField）
フォームJSONスキーマ例（3パターン）
title/date中心
list中心
画像中心
反映フロー（取得→表示→編集→検証→反映）

エラーハンドリング仕様
LAYER_NOT_FOUND
LAYER_TYPE_MISMATCH
INVALID_TEXT_LENGTH
INVALID_IMAGE_FORMAT
MCP_TIMEOUT
APPLY_PARTIAL_FAILED
MVP開発フェーズ（Phase 1〜3）
受け入れ基準（テスト観点）
将来拡張（多言語差し替え・一括生成・テンプレ管理）

追加指定（重要）
OpenAPI 3.1 形式でAPI仕様を出力
form-schema のTypeScript型を出力
list_XXX 可変対応の疑似コードを出力
リトライ戦略（指数バックオフ/部分再適用）を含める
非エンジニア向け運用ガイド（命名規約・禁止事項）を1ページで出力

---
島図エクセルの各台番別のデータを抽出
台番のグループ範囲(xxx-yyy)レイヤーから個別にテキストを入れ替える
スタイルはdefaultレイヤーのスタイルをコピーして利用
島図には各台数別に枠が用意されているため、台数に応じたレイヤーサイズを調整し、
テキストを入れ替える必要がある
枠からテキストがはみ出る場合は、テキストサイズを自動で縮小する機能も必要
1枠サイズ(1台分)のサイズは、文字を縦書きに置き換えてから、サイズ調整を行う。

