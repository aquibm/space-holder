import * as Hapi from '@hapi/hapi'

import { Cache } from './lib/cache'
import { indexSourceFiles } from './lib/indexer'

// Routes
import Ping from './routes/ping'
import Image from './routes/image'

const init = async () => {
    const server = Hapi.server({
        port: 8080,
        host: 'localhost',
    })

    const sourceFiles = await indexSourceFiles()
    const cache = new Cache()

    server.route(Ping())
    server.route(Image(sourceFiles, cache))

    await server.start()
    console.log(`space-holder server running on ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()
