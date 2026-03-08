---
name: issue-manager
description: GitHub の Issue 管理 (ghコマンド)
---

# issue-manager

## 本文作成時のガイドライン
Issue の本文を作成する際は、内容が過度に簡素にならないよう、第三者が読んでも十分な文脈が伝わるように詳細に記述する。
最低限以下の内容を含める：
- **背景・目的**: なぜこの Issue が必要なのか、どのような課題を解決するのか。
- **具体的な要件**: 実装または調査すべき具体的な機能、満たすべき条件。
- **期待される動作**: 最終的にどのような状態になることを目指すのか。
- **影響範囲や懸念点**: 他の機能への影響や、実装上考慮すべき技術的な事項。

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
