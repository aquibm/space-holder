import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { sourceImagePath } from './directory'

const readdir = promisify(fs.readdir)

/**
 * Indexes the source image files
 */
export const indexSourceFiles = async (): Promise<string[]> => {
    const files = await readdir(sourceImagePath)
    return files.map((fileName) => path.join(sourceImagePath, fileName))
}
