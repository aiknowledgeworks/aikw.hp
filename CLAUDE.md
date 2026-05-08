# AIKW HP Project Guidelines

## Project Overview
AIナレッジワークス合同会社のコーポレートサイト。静的HTML/CSS/JSで構成。
デザインシステム: Studio Orbit（Noto Serif/Sans JP + Fraunces、warm paper tones、scroll reveal）

## Context Management (最重要 — 違反厳禁)

### Read制限
- HTMLファイルの全文Read **絶対禁止**。全ファイル600〜1600行ある
- Readは必ず `limit: 50` 以下で使う。50行超が必要な場合は複数回に分けず、Grepで該当行を特定してからピンポイントで読む
- 構造把握にはGrepでセクション特定 → offset/limitで該当部分だけRead
- 「念のため確認」「比較のために読む」は禁止。既にCLAUDE.mdに書いてある情報は再確認しない

### 一括編集
- 全ページ共通修正（nav、footer、script追加等）は **Bashでsedワンライナー** で一括処理
- 7ファイル個別にGrep→Read→Editを繰り返すのは禁止。1回のBashコマンドで完了させる

### スクリーンショット
- 変更確認は **最終結果1枚のみ**。変更前スクショ不要（差分はコードで分かる）
- セクションごとに個別スクショ禁止。1回のフルページスクショで完結
- 他ページとのデザイン比較目的のスクショ禁止。Design System Tokensを直接適用する

### 応答の簡潔さ
- 作業完了報告は1〜2文。変更点の箇条書きは3項目まで
- コード変更の前後比較説明は不要（diffで分かる）
- 「次のステップ」「補足説明」は聞かれない限り書かない

## Design System Tokens
- Colors: --bg(#FAF8F5), --ink(#2C2A26), --paper(#FFFFFF), --paper-2(#F3EFE9), --rule(#D9D3C7), --accent(#3da8c7)
- Fonts: --sans(Noto Sans JP), --serif(Noto Serif JP), --display(Fraunces)
- Scroll reveal: `.reveal` + `.in` class (NOT `.active`) via IntersectionObserver threshold 0.1

## Pages
- index.html — トップページ（パーティクルアニメーション付き）
- service.html — サービス紹介（5タブ切り替え）
- achievements.html — 実績と展望（Stats, Case Studies, Portfolio, Future）
- company.html — 会社概要（Origin→story.htmlへリンク, Info, Philosophy, Strengths）
- story.html — 創業ストーリー + タイムライン（achievements.htmlから移動済み）
- contact.html — お問い合わせ
- businesspillars.html — service.html#pillarsへのリダイレクト

## Key Conventions
- 全ページにchatbot_v2.js読み込み（company.htmlのみ確認済み）
- ハンバーガーメニュー: `.hamburger.active` / `nav.active` / `.overlay.active`
- ヘッダースクロール: `header.scrolled` class
- 会長は退任済み。創業ストーリー内では匿名で言及（"博士号を持つAI研究者"）。社員数は2名
