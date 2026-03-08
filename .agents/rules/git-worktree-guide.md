---
trigger: always_on
---

# Git Worktree 手順

- **目的**: プロジェクトで並列作業を行う際、作業ブランチ間の状態が混ざらないようにするため。

- **作業ツリーの追加**:
  ```bash
  git worktree add ./llm-workspace/<作業ディレクトリ名> <ブランチ名>
  ```
- **作業ツリーの確認**:
  ```bash
  git worktree list
  ```
- **作業ツリーの削除** (未コミット変更がある場合は `-f`):
  ```bash
  git worktree remove ./llm-workspace/<作業ディレクトリ名>
  ```

Git Worktree内で作業しているときには、当然ファイルはWorktreeディレクトリ内のものを修正、追加、削除する。
メインのワークスペースファイルは絶対に変更せず、コマンド類はWorktreeディレクトリで実行する。
