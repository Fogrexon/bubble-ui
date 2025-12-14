# 設定の詳細

このドキュメントでは、Bubble UIの設定に関する詳細情報を提供します。

## プロジェクト構成

Bubble UIプロジェクトは、通常、TypeScriptの設定には`tsconfig.json`、依存関係やスクリプトには`package.json`を使用して構成されます。

### `tsconfig.json`

主要なTypeScript設定ファイルです。主な設定には以下が含まれます。

*   `"target"`: ターゲットとするJavaScript言語バージョン。
*   `"module"`: 使用するモジュールシステム（例: `ESNext`、`CommonJS`）。
*   `"jsx"`: 使用するJSXファクトリ（例: Reactの場合は`"react-jsx"`、Bubble UIの場合はカスタム）。
*   `"paths"`: `bubble-ui`自体のような内部モジュールの解決に不可欠なモジュールエイリアスマッピングに使用されます。
*   `"strict"`: 広範囲な型チェック検証を有効にします。

### `package.json`

プロジェクトのメタデータ、スクリプト、依存関係を管理します。

*   `"name"`: パッケージの名前。
*   `"version"`: パッケージの現在のバージョン。
*   `"scripts"`: `build`、`test`、`start`などの実行可能なスクリプトを定義します。
*   `"dependencies"`: プロジェクトに必要な本番環境の依存関係。
*   `"devDependencies"`: 開発環境の依存関係。

## Typedoc設定 (`typedoc.json`)

Typedocを使用してAPIドキュメントを生成する場合、`typedoc.json`ファイルがそのプロセスを設定するために使用されます。

*   `"entryPoints"`: Typedocが解析を開始するエントリファイルを指定します。
*   `"tsconfig"`: Typedocの解析に使用するTypeScript設定ファイルを指定します。
*   `"out"`: 生成されたドキュメントの出力ディレクトリ。
*   `"plugin"`: 使用するTypedocプラグイン（例: `typedoc-plugin-markdown`）。
*   `"projectDocuments"`: ドキュメント出力に追加するMarkdownファイルのグロブパターン配列。
*   `"exclude"`: ドキュメント生成から除外するファイルまたはパターン。

Typedocオプションの包括的なリストについては、[Typedocドキュメント](https://typedoc.org/guides/options/)を参照してください。