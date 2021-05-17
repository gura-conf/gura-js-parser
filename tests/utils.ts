import path from 'path'
import { readFileSync } from 'fs'
import { parse } from '../src/gura-parser'

/**
 * Gets the content of a specific file parsed.
 *
 * @param parentFolder - Folder name where tests files are stored.
 * @param filePath - Specific file name to get parsed.
 * @returns Parsed data.
 */
const getFileContentParsed = (parentFolder: string, filePath: string): Object => {
  const fullPath = path.join('tests', parentFolder, 'tests-files', filePath)
  return parse(readFileSync(fullPath, 'utf-8'))
}

export { getFileContentParsed }
