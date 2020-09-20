import Jimp from 'jimp'

/**
 * Resizes the specified source image
 * 
 * @param imagePath The absolute path of the image file, eg: home/source-images/space-copter.png
 * @param width The desired width
 * @param height The desired height
 */
export const resize = async (imagePath: string, width: number, height: number): Promise<Buffer> => {
    try {
        const instance = await Jimp.read(imagePath)
        return instance.cover(width, height).quality(60).getBufferAsync(Jimp.MIME_JPEG)
    } catch(error) {
        console.log(error)
        throw error
    }
}

export const mimeType = Jimp.MIME_JPEG