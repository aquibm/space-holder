import * as Hapi from '@hapi/hapi'
import Jimp from 'jimp'

import { Cache } from './cache'
import { resize } from './resizer'
import { indexSourceFiles } from './indexer'

const init = async () => {
    const server = Hapi.server({
        port: 8080,
        host: 'localhost'
    })

    const sourceFiles = await indexSourceFiles()
    const cache = new Cache()

    const getRandomSourceFile = (): string =>
        sourceFiles[Math.floor(Math.random() * sourceFiles.length)]

    const getImageName = (imagePath: string): string => {
        const parts = imagePath.split('\\')
        return parts[parts.length - 1]
    }

    server.route({
        method: 'GET',
        path: '/ping',
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            return h.response('pong')
        }
    })

    server.route({
        method: 'GET',
        path: '/index',
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            return h.response(sourceFiles)
        }
    })

    server.route({
        method: 'GET',
        path: '/{width}/{height}',
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            const imagePath = getRandomSourceFile()
            const imageName = getImageName(imagePath)

            const width = Number(request.params.width) || 480
            const height = Number(request.params.height) || width

            try {

                const imageBuffer = await cache.get(imageName, width, height)
                return h.response(imageBuffer).type(Jimp.MIME_JPEG)

            } catch(error) {

                if(error.name === 'CacheError') {
                    const imageBuffer = await resize(imagePath, width, height)
                    cache.add(imageName, width, height, imageBuffer)
                    return h.response(imageBuffer).type(Jimp.MIME_JPEG)
                }
            }
        }
    })

    await server.start()
    console.log(`space-holder server running on ${server.info.uri}`)
}

process.on('unhandledRejection', err => {
    console.log(err)
    process.exit(1)
})

init()