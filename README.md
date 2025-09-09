# aikw.hp - AIナレッジワークス 公式ホームページ

**Live Site**: https://aiknowledgeworks.net  
**GitHub Pages**: https://aiknowledgeworks.github.io/aikw.hp

## 概要

AIナレッジワークス合同会社の公式ウェブサイト。静的HTML/CSS/JavaScriptで構築されており、GitHub Pages で自動デプロイされています。

## チャットボット設定

### API Keyのセキュア管理
- **GitHub Environment Secrets**でDIFY_API_KEYを管理
- **ビルド時に自動置換**: GitHub Actionsがプレースホルダーを実際のAPI keyに置換
- **暗号化保存**: Web Crypto API (AES-GCM 256bit)でメモリ内で保護

### 本番環境での設定手順
1. Repository Settings > Environments > github-pages > Environment secrets
2. Name: `DIFY_API_KEY`
3. Value: [your-dify-api-key]
4. mainブランチにプッシュすると自動デプロイ

### 開発環境
- ローカルではAPI keyがプレースホルダーのため、UIは表示されるがAPI通信は無効化されます

## 開発コマンド

```bash
# ローカルサーバー起動
python -m http.server 8000
# または
npx http-server -p 8000

# デプロイ
git add .
git commit -m "Update content"
git push origin main
```
