import * as Hapi from '@hapi/hapi'
import { indexSourceFiles } from './indexer'

const init = async () => {
    const server = Hapi.server({
        port: 8080,
        host: 'localhost'
    })

    const sourceFiles = await indexSourceFiles()

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

    await server.start()
    console.log(`space-holder server running on ${server.info.uri}`)
}

process.on('unhandledRejection', err => {
    console.log(err)
    process.exit(1)
})

init()