import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const readdir = promisify(fs.readdir)

export const indexSourceFiles = async (): Promise<string[]> => {
    const sourcePath = path.join(path.dirname(require.main!.filename!), '../source-images')
    const files = await readdir(sourcePath)

    return files.map(fileName => path.join(sourcePath, fileName))
}