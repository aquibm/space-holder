import * as Hapi from '@hapi/hapi'
import Jimp from 'jimp'

import { indexSourceFiles } from './indexer'
import { resize } from './resizer'

const init = async () => {
    const server = Hapi.server({
        port: 8080,
        host: 'localhost'
    })

    const sourceFiles = await indexSourceFiles()
    const getRandomSourceFile = (): string =>
        sourceFiles[Math.floor(Math.random() * sourceFiles.length)]

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

            const width = Number(request.params.width) || 480
            const height = Number(request.params.height) || width

            // TODO(AM): Get from cache if available
            const imageBuffer = await resize(imagePath, width, height)
            // TODO(AM): Cache the new image

            return h.response(imageBuffer).type(Jimp.MIME_JPEG)
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