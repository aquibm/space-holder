import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

import { cachePath } from './directory'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)
const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)

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

    /**
     * Index files in the cache directory to build the internal cache map
     */
    async init() {
        try {
            await this.createCacheDirIfNotExists()

            const fileNames = await readdir(cachePath)

            fileNames.forEach((fileName) => {
                const [file, extension] = fileName.split('.')
                const [name, dimensions] = file.split('___')

                this.cache[name] = {
                    ...(this.cache[name] || {}),
                    [dimensions]: true,
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Add an image to the cache
     *
     * @param imageName The name of the image, eg: 'space-copter.png'
     * @param width The width of the image
     * @param height The height of the image
     * @param buffer The image data
     */
    async add(
        imageName: string,
        width: number,
        height: number,
        buffer: Buffer
    ): Promise<void> {
        try {
            const [name, extension] = imageName.split('.')
            const dimensions = `${width}x${height}`
            const absolutePath = this.getCacheItemPath(
                name,
                dimensions,
                extension
            )

            await writeFile(absolutePath, buffer)

            this.cache[name] = {
                ...(this.cache[name] || {}),
                [dimensions]: true,
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * Attempt to get an image from the cache. Will throw a CacheError if the
     * image does not exist.
     *
     * @param imageName Name of the image, eg: 'space-copter.png'
     * @param width Desired width
     * @param height Desired height
     */
    async get(
        imageName: string,
        width: number,
        height: number
    ): Promise<Buffer> {
        try {
            const [name, extension] = imageName.split('.')
            const dimensions = `${width}x${height}`
            const exists = this.cache[imageName] && this.cache[name][dimensions]
            const absolutePath = this.getCacheItemPath(
                name,
                dimensions,
                extension
            )

            if (!exists) {
                throw new CacheError('cache-miss')
            }

            const buffer = await readFile(absolutePath)
            return buffer
        } catch (error) {
            throw error
        }
    }

    private async createCacheDirIfNotExists(): Promise<void> {
        const cacheDirExists = await exists(cachePath)

        if (!cacheDirExists) {
            await mkdir(cachePath)
        }
    }

    private getCacheItemPath(
        itemName: string,
        dimensions: string,
        extension: string
    ): string {
        return path.join(cachePath, `${itemName}___${dimensions}.${extension}`)
    }
}
