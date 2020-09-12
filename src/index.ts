import * as Hapi from '@hapi/hapi'

const init = async () => {
    const server = Hapi.server({
        port: 8080,
        host: 'localhost'
    })

    server.route({
        method: 'GET',
        path: '/ping',
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            return h.response('pong')
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