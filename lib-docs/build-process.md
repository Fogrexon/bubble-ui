# Build Process

This document outlines the build process for the Bubble UI library.

## Prerequisites

Before building the library, ensure you have:
*   Node.js (LTS version recommended)
*   npm (Node Package Manager)

## Building the Library

To build the core `bubble-ui` library, navigate to the project root and run:

```bash
npm install
npm run build
```

This will compile the TypeScript source files into JavaScript and generate the necessary output files in the `dist/` directory.

## Running Tests

To run the unit tests, use the following command:

```bash
npm test
```

For a single test run without watching files:

```bash
npm run test:once
```

## Linting and Type Checking

To check for linting errors and type issues, run:

```bash
npm run lint
npm run typecheck
```