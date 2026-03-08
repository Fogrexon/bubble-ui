# 開発ワークフロー

- GitHub Issue / PR ベースの開発
- **ブランチ命名規則**: 作業内容を示す一般的なプレフィックス（`feature/`, `bugfix/`, `devops/` 等）を付与する
- **Issue と PR による管理**: タスクの管理やコードの提案は、すべて GitHub Issue と Pull Request を通じて行う
- **専用スキルの利用**: Issue の確認・作成・編集や、PR の作成を行う必要がある場合は、直接 `gh` コマンドを実行せず、プロジェクトに用意されている以下の専用スキルを利用する
  - Issue の操作: `issue-manager`
  - PR の操作: `pull-request-manager`
- 単発テスト実行:
  ```bash
  npm run test:once
  ```
- ドキュメントは `docs/` 配下（API ドキュメントは自動生成）
