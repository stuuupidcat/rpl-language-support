npx tsup src/extension.ts --format cjs --external vscode --no-shims
npx @vscode/vsce publish --no-dependencies