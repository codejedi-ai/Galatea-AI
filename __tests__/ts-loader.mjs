// Custom loader to resolve extensionless TypeScript imports for node:test
import { resolve as pathResolve, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'

export async function resolve(specifier, context, nextResolve) {
  // Only handle relative specifiers without an extension
  if (specifier.startsWith('.') && !extname(specifier)) {
    const parentDir = context.parentURL
      ? fileURLToPath(new URL('.', context.parentURL))
      : process.cwd()

    for (const ext of ['.ts', '.tsx', '.js', '.mjs']) {
      const candidate = pathResolve(parentDir, specifier + ext)
      if (existsSync(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context)
      }
    }
  }
  return nextResolve(specifier, context)
}
