---
name: pull-request-manager
description: 完成したコード変更をチームに提案するため、GitHub CLI（ghコマンド）を用いてターミナルからPull Requestを作成・送信する必要がある際に起動する。
---

# pull-request-manager

## 本文作成時のガイドライン
Pull Request の本文を作成する際は、内容が過度に簡素にならないよう、レビュアーが変更の意図や影響を正確に把握できるように詳細に記述する。
最低限以下の内容を含める：
- **変更の概要**: なぜこの変更を行ったのか、どの Issue を解決するものか。
- **実装の詳細**: 具体的にどのような技術的アプローチで実装したのか、重要な設計の判断は何か。
- **検証方法と結果**: どのような確認やテストを行い、正常に動作することをどう担保したか。
- **影響範囲**: この変更によって影響を受ける可能性のある他のコンポーネントや機能は何か。

## 手順

### 1. 変更のコミットとプッシュ
現在の作業ブランチをリモートに push する。

### 2. Pull Request の作成
※ コマンドライン引数での特殊文字エラーを防ぐため、必ずファイル経由で本文を渡す。
1. `write_to_file` を使用して `llm-workspace/pr_body.md` 等に本文を保存する（関連する Issue 番号を必ず含めて Close させる）。
   （テンプレート `.github/pull_request_template.md` または `.github/PULL_REQUEST_TEMPLATE.md` 等が存在する場合はそれに従う）
2. 以下のコマンドを実行する。
```bash
gh pr create --title "[PR タイトル]" --body-file llm-workspace/pr_body.md
```

### 3. 作成確認
出力された PR の URL を確認し、作成が成功したことを担保する。

### 4. Pull Request の一覧表示
以下のコマンドを実行する。
```bash
gh pr list
```
