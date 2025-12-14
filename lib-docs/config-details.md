# Configuration Details

This document provides detailed information about configuring Bubble UI.

## Project Configuration

Bubble UI projects are typically configured via `tsconfig.json` for TypeScript settings and `package.json` for dependencies and scripts.

### `tsconfig.json`

The primary TypeScript configuration file. Key settings include:

*   `"target"`: The JavaScript language version to target.
*   `"module"`: The module system to use (e.g., `ESNext`, `CommonJS`).
*   `"jsx"`: Specifies the JSX factory to use (e.g., `"react-jsx"` for React, or a custom one for Bubble UI).
*   `"paths"`: Used for module alias mapping, essential for resolving internal modules like `bubble-ui` itself.
*   `"strict"`: Enables a wide range of type checking validations.

### `package.json`

Manages project metadata, scripts, and dependencies.

*   `"name"`: The name of your package.
*   `"version"`: The current version of your package.
*   `"scripts"`: Defines executable scripts, such as `build`, `test`, `start`.
*   `"dependencies"`: Production dependencies required by your project.
*   `"devDependencies"`: Development dependencies.

## Typedoc Configuration (`typedoc.json`)

When generating API documentation using Typedoc, the `typedoc.json` file is used to configure the process.

*   `"entryPoints"`: Specifies the entry files for Typedoc to start parsing.
*   `"tsconfig"`: Points to the TypeScript configuration file to use for Typedoc's analysis.
*   `"out"`: The output directory for the generated documentation.
*   `"plugin"`: Specifies Typedoc plugins to use (e.g., `typedoc-plugin-markdown`).
*   `"projectDocuments"`: An array of glob patterns to include additional Markdown files in the documentation output.
*   `"exclude"`: Files or patterns to exclude from documentation generation.

For a comprehensive list of Typedoc options, refer to the [Typedoc Documentation](https://typedoc.org/guides/options/).