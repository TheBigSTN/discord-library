---
title: Getting Started
children:
  - ./Starting.md
---

# Getting Started

Welcome to the documentation for the Discord Bot Library! This guide will help you get started with setting up and using the bot, step by step.

## Prerequisites

Before you start you need to install this pakage

```bash
npm i discord-library
```

It is recomended for typescript to be used but it's not required.
To install it you need to run the folowing command

```bash
npm i -D typescript
```

## Setting Up the Project

### Typescript

If you chose to use typescript you can folow a quick tutorial for it [here](https://www.youtube.com/watch?v=d56mG7DezGs).

To configure typescript i suggest you to use this configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "allowJs": true,
    "strict": true,
    "noImplicitAny": true,
    "declaration": false,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

This configuration is what configuration this project uses and is 100% optional you can use what configuration you whant this is a kind of template.

### Tsup

Like typescript it's optional but it does make the output code smaller.

This project tsup config at tsup.config.ts or tsup.config.js depending on what you use.

This configuration was made for a ts project and might not work in js.

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
});
```

## [Continuation to documentation](Starting.md)
