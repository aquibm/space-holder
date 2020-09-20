import { Request, ResponseToolkit } from '@hapi/hapi'

import { Cache } from '../lib/cache'
import { resize, mimeType } from '../lib/resizer'

const getRandomSourceFile = (sourceFiles: string[]): string =>
    sourceFiles[Math.floor(Math.random() * sourceFiles.length)]

const getImageName = (imagePath: string): string => {
    const parts = imagePath.split('\\')
    return parts[parts.length - 1]
}

/**
 * Returns a random image with the dimensions specified by the user
 *
 * @param sourceFiles List of source image file paths
 * @param cache The cache object
 */
const ImageRoute = (sourceFiles: string[], cache: Cache) => {
    const handler = async (request: Request, h: ResponseToolkit) => {
        const imagePath = getRandomSourceFile(sourceFiles)
        const imageName = getImageName(imagePath)

        const width = Number(request.params.width) || 480
        const height = Number(request.params.height) || width

        try {
            const imageBuffer = await cache.get(imageName, width, height)
            return h.response(imageBuffer).type(mimeType)
        } catch (error) {
            if (error.name === 'CacheError') {
                const imageBuffer = await resize(imagePath, width, height)
                cache.add(imageName, width, height, imageBuffer)
                return h.response(imageBuffer).type(mimeType)
            }
        }
    }

    return {
        method: 'GET',
        path: '/{width}/{height}',
        handler,
    }
}

export default ImageRoute
