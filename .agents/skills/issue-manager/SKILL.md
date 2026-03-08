---
name: issue-manager
description: GitHub の Issue 管理 (ghコマンド)
---

# issue-manager

## 手順

### 1. Issue の作成
※ コマンドライン引数での特殊文字エラーを防ぐため、必ずファイル経由で本文を渡す。
1. `write_to_file` を使用して `llm-workspace/issue_body.md` 等に本文を保存する。
   （テンプレート `.github/ISSUE_TEMPLATE/issue_template.md` が存在する場合はそれに従う）
2. 以下のコマンドを実行する。
```bash
gh issue create --title "タイトル" --body-file llm-workspace/issue_body.md
```

### 2. Issue へのコメント追加
1. `write_to_file` を使用して `llm-workspace/issue_comment.md` 等にコメントを保存する。
2. 以下のコマンドを実行する。
```bash
gh issue comment <issue-number> --body-file llm-workspace/issue_comment.md
```

### 3. Issue のクローズ
以下のコマンドを実行する（理由は `completed`, `not planned` 等を適宜指定）。
```bash
gh issue close <issue-number> --reason "completed"
```

### 4. Issue の一覧表示
以下のコマンドを実行する。
```bash
gh issue list
```
