# ビルド方法

このドキュメントでは、Bubble UIライブラリのビルド方法について説明します。

## 前提条件

ライブラリをビルドする前に、以下がインストールされていることを確認してください。
*   Node.js (LTSバージョンを推奨)
*   npm (Node Package Manager)

## ライブラリのビルド

コアとなる`bubble-ui`ライブラリをビルドするには、プロジェクトルートに移動して以下を実行します。

```bash
npm install
npm run build
```

これにより、TypeScriptのソースファイルがJavaScriptにコンパイルされ、`dist/`ディレクトリに必要な出力ファイルが生成されます。

## テストの実行

ユニットテストを実行するには、以下のコマンドを使用します。

```bash
npm test
```

ファイルの監視なしで一度だけテストを実行するには：

```bash
npm run test:once
```

## Lintingと型チェック

Lintingエラーと型エラーをチェックするには、以下を実行します。

```bash
npm run lint
npm run typecheck
```