import { Request, ResponseToolkit } from '@hapi/hapi'

/**
 * Returns a value indicating whether the server is up and runnin
 */
export default () => ({
    method: 'GET',
    path: '/ping',
    handler: async (request: Request, h: ResponseToolkit) => {
        return h.response('pong')
    },
})
