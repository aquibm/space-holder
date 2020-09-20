import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)

type CacheMap = {
    [imageName: string]: {
        [dimensions: string]: boolean
    }
}

export class CacheError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CacheError'
    }
}

export class Cache {
    cache: CacheMap

    constructor() {
        this.cache = {}
        this.init()
    }

    async init() {
        try {
            const cacheDir = path.join(path.dirname(require.main!.filename!), '..', '.cache')
            const fileNames = await readdir(cacheDir)

            fileNames.forEach(fileName => {
                const [file, extension] = fileName.split('.')
                const [name, dimensions] = file.split('___')

                this.cache[name] = {
                    ...(this.cache[name] || {}),
                    [dimensions]: true
                }
            })
        } catch(error) {
            console.log(error)
        }
    }

    async add(imageName: string, width: number, height: number, buffer: Buffer): Promise<void> {
        try {
            const [name, extension] = imageName.split('.')
            const dimensions = `${width}x${height}`
            const absolutePath = path.join(path.dirname(require.main!.filename!), '..', '.cache', `${name}___${dimensions}.${extension}`)

            await writeFile(absolutePath, buffer)

            this.cache[name] = {
                ...(this.cache[name] || {}),
                [dimensions]: true
            }
        } catch(error) {
            throw error
        }
    }

    async get(imageName: string, width: number, height: number): Promise<Buffer> {
        try {
            const [name, extension] = imageName.split('.')
            const dimensions = `${width}x${height}`
            const exists = this.cache[imageName] && this.cache[name][dimensions]
            const absolutePath = path.join(path.dirname(require.main!.filename!), '..', '.cache', `${name}___${dimensions}.${extension}`)

            if(!exists) {
                throw new CacheError('cache-miss')
            }

            const buffer = await readFile(absolutePath)
            return buffer
        } catch(error) {
            throw error
        }
    }
}