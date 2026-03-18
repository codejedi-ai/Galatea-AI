/**
 * Minimal Jest transformer that uses TypeScript's transpileModule to strip
 * type annotations before handing the result to Jest's default JS runtime.
 *
 * This is intentionally lightweight — it mirrors what ts-jest does in
 * isolatedModules mode without requiring ts-jest as a dependency.
 */
const ts = require("typescript")
const path = require("path")

module.exports = {
  process(sourceText, sourcePath) {
    if (!sourcePath.endsWith(".ts") && !sourcePath.endsWith(".tsx")) {
      return { code: sourceText }
    }

    const result = ts.transpileModule(sourceText, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2019,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        jsx: ts.JsxEmit.React,
        strict: false,
        skipLibCheck: true,
      },
      fileName: path.basename(sourcePath),
    })

    return { code: result.outputText }
  },
}
