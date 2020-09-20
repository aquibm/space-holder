import path from 'path'

const basePath = path.dirname(require.main!.filename)

/**
 * Path for source images
 */
export const sourceImagePath = path.join(basePath, '../source-images')

/**
 * Path for cache
 */
export const cachePath = path.join(basePath, '../.cache')